#!/usr/bin/env python3
"""Claude Wrapped — aggregates local Claude Code usage into a stats JSON.

Reads ~/.claude/projects/**/*.jsonl transcripts and prints a single JSON
object to stdout. No network, no writes. Used by the /wrapped skill.

Usage:
  python analyze.py [--days N] [--since YYYY-MM-DD]
"""
import json, os, glob, sys, argparse
from collections import Counter
from datetime import datetime, timedelta, timezone

# Where the render engine + Clawd/fire images are hosted (jsDelivr serves any public
# GitHub repo). Replace ARIKBAR/REPO with yours, then the /wrapped command emits
# only a ~700-byte loader instead of the whole 36KB widget.
CDN_BASE = "https://cdn.jsdelivr.net/gh/ARIKBAR/claude-code-wrapped@main/render/"

def emit_widget(out, lang, base):
    he_mon=['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
    en_mon=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    bd=out['busiestDay']['date']; busiest=''
    if bd:
        try:
            _,m,d=bd.split('-'); m=int(m); d=int(d)
            busiest=(str(d)+' ב'+he_mon[m-1]) if lang=='he' else (en_mon[m-1]+' '+str(d))
        except: busiest=bd
    tot=out['totalUserPrompts'] or 1
    fam=out['toolFamilies']; models=out['models']
    fav=models[0][0] if models else 'Opus 4.8'
    pk=out['peakHour']
    if lang=='he': peak=('חצות' if pk==0 else 'צהריים' if pk==12 else ('%02d:00'%pk))
    else: peak=('midnight' if pk==0 else 'noon' if pk==12 else ('%02d:00'%pk))
    pname=out['persona']['name']
    pkey='owl' if 'Night' in pname else ('bird' if 'Early' in pname else 'steady')
    D={
      'persona':pkey,'peakHour':peak,
      'sessions':out['totalSessions'],'prompts':out['totalUserPrompts'],'replies':out['totalAssistantMsgs'],
      'tools':out['totalToolCalls'],'agents':out['agentRuns'],'variety':out['toolVariety'],'mcp':fam['mcp'],
      'activeDays':out['activeDays'],'busiestN':out['busiestDay']['events'],'busiest':busiest,
      'chars':out['userChars'],'longest':out['longestPrompt'],'reads':fam['reads'],'edits':fam['edits'],'writes':fam['writes'],
      'outTok':str(out['outputTokensM'])+'M','totTok':str(out['totalTokensB'])+'B',
      'weekendPct':out['weekendPct'],'weekdayPct':out['weekdayPct'],'avgPrompts':str(out['avgPromptsPerSession']),
      'percentile':out['estPercentile'],'novels':max(1,round(out['userChars']/550000)),'favModel':fav,
      'topTools':[[t[0],t[1]] for t in out['topTools'][:5]],
      'projects':[[p[0],str(round(p[1]/tot*100))+'%'] for p in out['projects'][:4]],
      'actions':[['Edit',fam['edits']],['Read',fam['reads']],['Write',fam['writes']]],
    }
    dj=json.dumps(D, ensure_ascii=False, separators=(',',':'))
    print('<div id="cw-root"></div>')
    print('<script>window.CW={lang:"'+lang+'",base:"'+base+'",D:'+dj+'};</script>')
    print('<script src="'+base+'wrapped.js"></script>')

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--days', type=int, default=None, help='only include the last N days')
    ap.add_argument('--since', type=str, default=None, help='only include from YYYY-MM-DD')
    ap.add_argument('--widget', action='store_true', help='print the tiny show_widget loader instead of JSON')
    ap.add_argument('--lang', default='he', choices=['he','en'], help='widget language (he=RTL, en=LTR)')
    ap.add_argument('--base', default=CDN_BASE, help='CDN base URL hosting wrapped.js + images')
    args = ap.parse_args()

    cutoff = None
    if args.since:
        cutoff = datetime.fromisoformat(args.since).replace(tzinfo=timezone.utc)
    elif args.days:
        cutoff = datetime.now(timezone.utc) - timedelta(days=args.days)

    base = os.path.expanduser('~/.claude/projects')
    files = glob.glob(os.path.join(base, '**', '*.jsonl'), recursive=True)

    sessions=set(); projects=Counter(); tools=Counter(); models=Counter()
    user_msgs=0; assistant_msgs=0
    in_tok=out_tok=cache_read=cache_create=0
    by_hour=Counter(); by_dow=Counter(); by_date=Counter(); by_month=Counter()
    user_chars=0; longest_prompt=0
    first_ts=last_ts=None
    agent_runs=0
    sess_min={}; sess_max={}   # per-session first/last timestamp for durations

    model_clean={'claude-opus-4-8':'Opus 4.8','claude-opus-4-7':'Opus 4.7',
        'claude-opus-4-6':'Opus 4.6','claude-sonnet-4-6':'Sonnet 4.6',
        'claude-haiku-4-5-20251001':'Haiku 4.5','claude-fable-5':'Fable 5'}

    for f in files:
        if 'subagents' in f.replace('\\','/'):
            agent_runs += 1
        try:
            with open(f, encoding='utf-8') as fh:
                for line in fh:
                    try: o=json.loads(line)
                    except: continue
                    ts=o.get('timestamp'); dt=None
                    if ts:
                        try: dt=datetime.fromisoformat(ts.replace('Z','+00:00'))
                        except: dt=None
                    if cutoff and dt and dt < cutoff:
                        continue
                    sid=o.get('sessionId')
                    if sid: sessions.add(sid)
                    if dt:
                        if first_ts is None or dt<first_ts: first_ts=dt
                        if last_ts is None or dt>last_ts: last_ts=dt
                        by_hour[dt.hour]+=1; by_dow[dt.weekday()]+=1
                        by_date[dt.date().isoformat()]+=1; by_month[dt.strftime('%Y-%m')]+=1
                        if sid:
                            if sid not in sess_min or dt<sess_min[sid]: sess_min[sid]=dt
                            if sid not in sess_max or dt>sess_max[sid]: sess_max[sid]=dt
                    t=o.get('type'); m=o.get('message') or {}
                    if not isinstance(m, dict): m={}
                    cwd=o.get('cwd')
                    if t=='user' and m.get('role')=='user':
                        c=m.get('content')
                        if isinstance(c, str):
                            user_msgs+=1; user_chars+=len(c)
                            longest_prompt=max(longest_prompt, len(c))
                            if cwd: projects[os.path.basename(cwd.rstrip('/\\'))]+=1
                    if t=='assistant':
                        assistant_msgs+=1
                        mdl=m.get('model')
                        if mdl and mdl!='<synthetic>':
                            models[model_clean.get(mdl, mdl)]+=1
                        u=m.get('usage') or {}
                        in_tok+=u.get('input_tokens',0) or 0
                        out_tok+=u.get('output_tokens',0) or 0
                        cache_read+=u.get('cache_read_input_tokens',0) or 0
                        cache_create+=u.get('cache_creation_input_tokens',0) or 0
                        c=m.get('content')
                        if isinstance(c, list):
                            for b in c:
                                if isinstance(b, dict) and b.get('type')=='tool_use':
                                    tools[b.get('name')]+=1
        except: pass

    dow_names=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    peak_hour=(by_hour.most_common(1) or [(0,0)])[0]
    peak_dow=(by_dow.most_common(1) or [(0,0)])[0]
    busiest=(by_date.most_common(1) or [('',0)])[0]

    # session durations
    durations=[]  # minutes
    for sid in sess_min:
        d=(sess_max[sid]-sess_min[sid]).total_seconds()/60.0
        if d>=0: durations.append(d)
    total_hours=round(sum(durations)/60.0,1)
    longest_session_min=round(max(durations),0) if durations else 0
    avg_session_min=round(sum(durations)/len(durations),0) if durations else 0

    # weekday vs weekend
    weekend=by_dow.get(5,0)+by_dow.get(6,0)
    weekday=sum(by_dow.get(d,0) for d in range(5))
    total_dow=weekend+weekday or 1

    # specific tool families
    def tc(*names): return sum(tools.get(n,0) for n in names)
    reads=tc('Read'); edits=tc('Edit','MultiEdit'); writes=tc('Write')
    bash_runs=tc('Bash','PowerShell'); searches=tc('Grep','Glob')
    web=tc('WebSearch','WebFetch'); todos=tc('TodoWrite','TaskCreate','TaskUpdate')
    mcp_calls=sum(v for k,v in tools.items() if isinstance(k,str) and k.startswith('mcp__'))

    # chronological monthly series
    mon_names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    months_sorted=sorted(by_month.items())
    month_series=[{'key':k,'label':mon_names[int(k.split('-')[1])-1]+' '+k.split('-')[0],'count':v} for k,v in months_sorted]
    top_month=max(month_series,key=lambda x:x['count']) if month_series else None

    # persona from hour distribution
    total_h=sum(by_hour.values()) or 1
    night=sum(by_hour.get(h,0) for h in [22,23,0,1,2,3])/total_h
    morning=sum(by_hour.get(h,0) for h in [5,6,7,8,9,10])/total_h
    if night>=0.33: persona=('Night Owl','\U0001F989')
    elif morning>=0.33: persona=('Early Bird','\U0001F426')
    else: persona=('Steady Builder','⚙️')

    out={
        'totalSessions':len(sessions),'totalUserPrompts':user_msgs,
        'totalAssistantMsgs':assistant_msgs,'totalToolCalls':sum(tools.values()),
        'agentRuns':agent_runs,'projects':projects.most_common(8),
        'projectCount':len(projects),'topTools':tools.most_common(8),
        'models':models.most_common(),'tokens':{'input':in_tok,'output':out_tok,
            'cacheRead':cache_read,'cacheCreate':cache_create},
        'totalTokens':in_tok+out_tok+cache_read+cache_create,
        'outputTokensM':round(out_tok/1_000_000,1),'totalTokensB':round((in_tok+out_tok+cache_read+cache_create)/1_000_000_000,2),
        'userChars':user_chars,'longestPrompt':longest_prompt,
        'firstDate':first_ts.isoformat() if first_ts else None,
        'lastDate':last_ts.isoformat() if last_ts else None,
        'activeDays':len(by_date),
        'busiestDay':{'date':busiest[0],'events':busiest[1]},
        'peakHour':peak_hour[0],'peakDow':dow_names[peak_dow[0]],
        'persona':{'name':persona[0],'emoji':persona[1]},
        'byHour':[by_hour.get(h,0) for h in range(24)],
        'byDow':[by_dow.get(d,0) for d in range(7)],
        'byMonth':by_month.most_common(),
        'monthSeries':month_series,
        'topMonth':top_month,
        'toolVariety':len(tools),
        'toolFamilies':{'reads':reads,'edits':edits,'writes':writes,'bash':bash_runs,
            'searches':searches,'web':web,'todos':todos,'mcp':mcp_calls},
        'totalActiveHours':total_hours,
        'longestSessionMin':longest_session_min,
        'avgSessionMin':avg_session_min,
        'avgPromptsPerSession':round(user_msgs/max(1,len(sessions)),1),
        'weekendPct':round(weekend/total_dow*100),
        'weekdayPct':round(weekday/total_dow*100),
        'toolsPerActiveDay':round(sum(tools.values())/max(1,len(by_date))),
        # --- ESTIMATED competitive framing (NOT official population data) ---
        # Rough percentile bucket from how heavy the usage is. Clearly an estimate;
        # the widget shows it with a "*" footnote. Tune thresholds as desired.
        'estPercentile':(lambda t: '1%' if t>=15000 else '3%' if t>=8000 else
            '8%' if t>=3000 else '20%' if t>=800 else '50%')(sum(tools.values())),
        # tool calls vs an assumed ~750/period casual baseline, capped for sanity
        'estAvgMultiple':max(1,min(50,round(sum(tools.values())/750))),
    }
    if args.widget:
        emit_widget(out, args.lang, args.base)
    else:
        print(json.dumps(out, ensure_ascii=False, indent=2))

if __name__=='__main__':
    main()

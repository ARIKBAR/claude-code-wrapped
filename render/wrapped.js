/* Claude Wrapped — render engine. Hosted on a CDN (jsDelivr from GitHub).
   The /wrapped command emits only a tiny loader:
     <div id="cw-root"></div>
     <script>window.CW={lang:"he",base:"<cdn>/render/",D:{...stats...}};</script>
     <script src="<cdn>/render/wrapped.js"></script>
   Everything heavy (CSS, slide engine, pixel canvas, Clawd/fire images) lives here. */
(function(){
  var CW=window.CW||{};var D=CW.D||{};var LANG=CW.lang||'he';var BASE=CW.base||'';
  var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;}catch(_){}
  function fmt(n){return (typeof n==='number')?n.toLocaleString('en-US'):n;}

  var CSS="@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@700;800&family=Heebo:wght@400;500;700&display=swap');"+
  "#cw-root{display:flex;justify-content:center;padding:8px 0;--cream:#F4F2EC;--cream2:#EDE9DF;--sand:#E0C5B0;--clay:#CC785C;--clayd:#B0593F;--rust:#8A4530;--ink:#23211E;--inks:#6B655C;--fd:'Space Grotesk',sans-serif;--fm:'JetBrains Mono',monospace;--fh:'Heebo',sans-serif}"+
  "#cw-card{position:relative;width:346px;height:614px;border-radius:24px;overflow:hidden;background:var(--cream);box-shadow:0 16px 46px rgba(20,20,19,.34);user-select:none;font-family:var(--fh);transition:background .45s ease}"+
  "#cw-bars{position:absolute;top:14px;left:14px;right:14px;display:flex;gap:5px;z-index:6}"+
  ".cw-seg{flex:1;height:3px;border-radius:3px;overflow:hidden;background:rgba(35,33,30,.18)}"+
  ".cw-seg>i{display:block;height:100%;width:0;background:var(--clay);border-radius:3px}"+
  ".cw-seg.done>i{width:100%}.cw-seg.active>i{width:100%;transition:width var(--dur,5000ms) linear}"+
  "#cw-prev,#cw-next{position:absolute;top:0;bottom:0;z-index:5;cursor:pointer;background:transparent}"+
  "#cw-stage{position:absolute;inset:0;z-index:2}"+
  ".cw-acc{position:absolute;left:0;right:0;bottom:0;height:190px;z-index:0;pointer-events:none}"+
  ".cw-acc canvas{width:100%;height:100%;display:block}"+
  ".cw-acc::before{content:'';position:absolute;inset:0;z-index:1;background:linear-gradient(to bottom,var(--cream) 0%,rgba(244,242,236,0) 42%)}"+
  ".cw-slide{position:absolute;inset:0;display:none;flex-direction:column;justify-content:center;padding:54px 30px 56px;box-sizing:border-box;color:var(--ink);z-index:2}"+
  ".cw-slide.on{display:flex}.cw-slide.dark{background:var(--ink);color:var(--cream)}"+
  ".cw-slide.dark .cw-acc::before{background:linear-gradient(to bottom,var(--ink) 0%,rgba(35,33,30,0) 42%)}"+
  ".cw-slide.clay{background:var(--clay);color:var(--cream)}"+
  ".cw-slide.clay .cw-acc::before{background:linear-gradient(to bottom,var(--clay) 0%,rgba(204,120,92,0) 42%)}"+
  ".cw-in{position:relative;z-index:2;display:flex;flex-direction:column;flex:1;justify-content:center;gap:6px}"+
  ".cw-eb{font-family:var(--fm);font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--clayd);display:flex;align-items:center;gap:8px;margin-bottom:12px}"+
  ".cw-slide.dark .cw-eb{color:var(--sand)}.cw-slide.clay .cw-eb{color:var(--rust)}"+
  ".cw-spark{width:11px;height:11px;background:currentColor;flex:none;clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)}"+
  ".cw-ix{margin-inline-start:auto;opacity:.5;font-weight:700;direction:ltr}"+
  ".cw-lbl{font-family:var(--fh);font-weight:500;font-size:17px;color:var(--inks)}"+
  ".cw-slide.dark .cw-lbl{color:var(--sand)}.cw-slide.clay .cw-lbl{color:var(--cream);opacity:.9}"+
  ".cw-head{font-family:var(--fd);font-weight:700;line-height:1.02;letter-spacing:-1px}"+
  ".cw-big{font-family:var(--fm);font-weight:800;font-size:90px;line-height:.84;color:var(--clay);letter-spacing:-3px;font-variant-numeric:tabular-nums}"+
  ".cw-big.sm{font-size:64px}.cw-slide.clay .cw-big{color:var(--cream)}"+
  ".cw-unit{font-family:var(--fm);font-weight:700;font-size:18px;color:var(--rust);margin-top:2px}"+
  ".cw-slide.dark .cw-unit{color:var(--sand)}.cw-slide.clay .cw-unit{color:var(--cream);opacity:.85}"+
  ".cw-ctx{font-family:var(--fh);font-size:15px;line-height:1.5;color:var(--inks);margin-top:12px}"+
  ".cw-slide.dark .cw-ctx{color:var(--sand)}.cw-slide.clay .cw-ctx{color:var(--cream);opacity:.92}"+
  ".cw-sub{font-family:var(--fh);font-size:16px;line-height:1.5;color:var(--inks);margin-top:6px}"+
  ".cw-slide.dark .cw-sub{color:var(--sand)}.cw-slide.clay .cw-sub{color:var(--cream);opacity:.92}"+
  ".cw-ranks{display:flex;flex-direction:column;gap:9px;margin-top:6px}"+
  ".cw-rank{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;background:var(--cream2)}"+
  ".cw-rank.top{background:var(--clay)}.cw-slide.dark .cw-rank{background:#312d27}"+
  ".cw-rn{font-family:var(--fm);font-weight:800;font-size:18px;color:var(--clayd);width:20px;flex:none}"+
  ".cw-rank.top .cw-rn{color:var(--cream)}.cw-rnm{font-family:var(--fd);font-weight:500;font-size:17px}"+
  ".cw-rank.top .cw-rnm{color:var(--cream)}.cw-slide.dark .cw-rnm{color:var(--cream)}"+
  ".cw-rv{margin-inline-start:auto;font-family:var(--fm);font-weight:700;font-size:14px;color:var(--inks)}"+
  ".cw-rank.top .cw-rv{color:var(--cream)}.cw-slide.dark .cw-rv{color:var(--sand)}"+
  ".cw-vs{display:flex;flex-direction:column;gap:16px;margin-top:8px}"+
  ".cw-vsl{display:flex;justify-content:space-between;font-family:var(--fm);font-weight:700;font-size:16px;margin-bottom:7px}"+
  ".cw-vsbar{height:20px;border-radius:7px;background:var(--cream2);overflow:hidden}.cw-slide.dark .cw-vsbar{background:#312d27}"+
  ".cw-vsbar>i{display:block;height:100%;background:var(--clay);border-radius:7px;width:0;transition:width 1s cubic-bezier(.2,.7,.2,1) .2s}"+
  ".cw-vsbar.alt>i{background:var(--rust)}"+
  ".cw-badge{width:72px;height:72px;border-radius:50%;background:var(--clay);display:flex;align-items:center;justify-content:center;font-size:34px;margin-bottom:4px}"+
  ".cw-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}"+
  ".cw-chip{padding:8px 15px;border-radius:40px;background:var(--cream2);font-family:var(--fm);font-weight:700;font-size:13px;color:var(--clayd)}"+
  ".cw-slide.dark .cw-chip{background:rgba(224,197,176,.16);color:var(--sand)}"+
  ".cw-brand{position:absolute;bottom:18px;font-family:var(--fm);font-weight:700;font-size:13px;color:var(--inks);display:flex;align-items:center;gap:8px;z-index:3}"+
  ".cw-slide.dark .cw-brand{color:var(--sand)}.cw-slide.clay .cw-brand{color:var(--cream)}"+
  ".cw-dot{width:9px;height:9px;border-radius:50%;background:var(--clay)}.cw-slide.clay .cw-dot{background:var(--cream)}"+
  ".cw-share{display:inline-flex;align-items:center;gap:10px;padding:12px 22px;border-radius:40px;background:var(--cream);color:var(--rust);font-family:var(--fm);font-weight:700;font-size:14px;cursor:pointer;border:0}"+
  ".cw-btns{display:flex;gap:9px;margin-top:18px;flex-wrap:wrap;z-index:4;position:relative}"+
  ".cw-b2{padding:11px 16px;border-radius:40px;background:rgba(244,242,236,.18);color:var(--cream);border:1px solid rgba(244,242,236,.5);font-family:var(--fm);font-weight:700;font-size:13px;cursor:pointer}"+
  ".cw-anim{opacity:0;transform:translateY(13px)}"+
  ".cw-slide.on .cw-anim{opacity:1;transform:none;transition:opacity .5s ease,transform .55s cubic-bezier(.2,.7,.2,1)}"+
  ".cw-slide.on .a1{transition-delay:.05s}.cw-slide.on .a2{transition-delay:.16s}.cw-slide.on .a3{transition-delay:.27s}.cw-slide.on .a4{transition-delay:.38s}.cw-slide.on .a5{transition-delay:.49s}.cw-slide.on .a6{transition-delay:.6s}"+
  "#cw-hint{position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:10px;opacity:.4;z-index:3;pointer-events:none;color:var(--inks)}"+
  "#cw-toast{position:absolute;bottom:62px;left:30px;right:30px;text-align:center;background:rgba(35,33,30,.92);color:var(--cream);font-size:13px;font-weight:600;padding:10px;border-radius:40px;z-index:9;opacity:0;transform:translateY(8px);transition:.3s;pointer-events:none;font-family:var(--fh)}"+
  "#cw-toast.show{opacity:1;transform:none}"+
  ".cw-clawd{display:block;image-rendering:pixelated;width:84px;height:auto;margin:0 0 6px;animation:cwbob 2.8s ease-in-out infinite;transform-origin:50% 72%}"+
  ".cw-fire{display:block;image-rendering:pixelated;margin:0 0 4px}"+
  "@keyframes cwbob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-5px) rotate(1.5deg)}}"+
  "@media (prefers-reduced-motion:reduce){.cw-seg.active>i{transition:none;width:100%}.cw-anim{opacity:1!important;transform:none!important;transition:none!important}.cw-vsbar>i{transition:none!important}.cw-clawd{animation:none!important}}";

  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  var root=document.getElementById('cw-root');
  root.innerHTML='<div id="cw-card" role="group"><div id="cw-bars"></div><div id="cw-next" role="button" tabindex="0"></div><div id="cw-prev" role="button" tabindex="0"></div><div id="cw-stage"></div><div id="cw-hint"></div><div id="cw-toast"></div></div>';

  window.cwfb=function(el){var sp=document.createElement('span');sp.textContent=el.getAttribute('data-fb')||'🦞';var w=parseInt(el.style.width)||80;sp.style.cssText='font-size:'+Math.round(w*0.7)+'px;line-height:1;display:block;margin:0 0 6px';sp.className=el.className;if(el.parentNode)el.parentNode.replaceChild(sp,el);};

  var PK=D.peakHour||'';
  var P_HE={owl:{h:"ינשוף<br>לילה 🦉",s:"שיא הפעילות שלך ב"+PK+". הקוד הכי טוב נכתב כשהעולם ישן.",c1:"#ינשוף",c2:"#לילה"},
    bird:{h:"ציפור<br>בוקר 🐦",s:"שיא הפעילות שלך ב"+PK+". כובש את היום מוקדם.",c1:"#בוקר",c2:"#מוקדם"},
    steady:{h:"בנאי<br>יציב ⚙️",s:"שיא הפעילות שלך ב"+PK+". קצב יציב לאורך כל היום.",c1:"#יציב",c2:"#ממוקד"}};
  var P_EN={owl:{h:"The Night<br>Owl 🦉",s:"Your peak is at "+PK+". The best code is written while the world sleeps.",c1:"#nightowl",c2:"#latenight"},
    bird:{h:"The Early<br>Bird 🐦",s:"Your peak is at "+PK+". You own the day before everyone wakes.",c1:"#earlybird",c2:"#mornings"},
    steady:{h:"The Steady<br>Builder ⚙️",s:"Your peak is at "+PK+". A steady rhythm all day long.",c1:"#steady",c2:"#focused"}};
  var PHE=P_HE[D.persona]||P_HE.owl, PEN=P_EN[D.persona]||P_EN.owl;
  var T={
   he:{dir:"rtl",font:"'Heebo',sans-serif",hint:"לחצו להמשך ◂",copied:"הסיכום הועתק ✓",
     copy:"⧉ העתק סיכום",img:"✦ תמונת שיתוף",again:"↺ שוב",aria:"Claude Wrapped — לחצו להמשך",
     introK:"CLAUDE CODE · 2026",introA:"חמישה חודשים, אינספור שורות קוד.",introH:"ה-Wrapped<br>שלך",introB:"הנה השנה שלך במספרים.",
     recapK:"2026 · סיכום",outH:"נתראה<br>בשנה הבאה",outS:"המשיכו לבנות. אנחנו פה.",
     S:[
      {t:"stat",k:"לא עצרת לרגע",l:"שיחות עבודה",n:D.sessions,u:"// סשנים",c:"בממוצע "+D.avgPrompts+" הודעות בכל שיחה."},
      {t:"stat",k:"דיברת הרבה",l:"הודעות ששלחת ל-Claude",n:D.prompts,u:"// פרומפטים",c:"ועוד "+fmt(D.replies)+" תשובות חזרה. שיחה אמיתית."},
      {t:"mile",k:"ציון דרך",b:"⚡",n:D.tools,h:"קריאות כלים",s:"מתוך "+D.variety+" כלים שונים. ניצלת את כל הארגז."},
      {t:"list",k:"הכלים שלך",h:"הכלים<br>הכי שחוקים",rows:D.topTools},
      {t:"mile",k:"איפה את/ה ביחס לכולם",b:"🔥",img:"fire",n:D.percentile,h:"העליונים",s:"לפי היקף השימוש שלך — ממש על אש. (הערכה)"},
      {t:"list",k:"פרויקטים",h:"לאן הלכה<br>האנרגיה",rows:D.projects},
      {t:"stat",k:"היום הכי עמוס",l:"השיא שלך היה ב-",head:D.busiest,n:D.busiestN,u:"// אירועים ביום אחד",c:"היום שבו פשוט לא הפסקת."},
      {t:"mile",k:"הטיפוס שלך",kick:"סוג המפתח שלך השנה",img:"clawd",h:PHE.h,s:PHE.s,chips:[PHE.c1,"#"+String(D.favModel).split(" ")[0],PHE.c2]},
      {t:"vs",k:"מתי קודדת",h:"חול מול<br>סוף-שבוע",a:["ימי חול",D.weekdayPct],bb:["סוף-שבוע",D.weekendPct],s:"קוד לא מכיר ימי מנוחה — וגם אתה לא."},
      {t:"list",k:"בקוד",h:"קראת ·<br>ערכת · כתבת",rows:D.actions},
      {t:"stat",k:"בלי מילים? לא אתכם",l:"תווים שהקלדת",n:D.chars,u:"// תווים",c:"כמו "+D.novels+" רומנים. ההודעה הכי ארוכה: "+fmt(D.longest)+" תווים."},
      {t:"stat",k:"מספרים גדולים",l:"טוקנים ש-Claude כתב בשבילך",big:D.outTok,u:"// טוקנים",c:D.totTok+" טוקנים עובדו בסך הכל השנה."},
      {t:"mile",k:"לא עבדת לבד",b:"🤖",n:D.agents,h:"סוכני משנה",s:"ועוד "+fmt(D.mcp)+" קריאות לכלי MCP מחוברים."}
     ]},
   en:{dir:"ltr",font:"'Space Grotesk',sans-serif",hint:"tap to continue ▸",copied:"Recap copied ✓",
     copy:"⧉ Copy recap",img:"✦ Share image",again:"↺ Replay",aria:"Claude Wrapped — tap to continue",
     introK:"CLAUDE CODE · 2026",introA:"Five months, countless lines of code.",introH:"Your<br>Wrapped",introB:"Here's your year in numbers.",
     recapK:"2026 · recap",outH:"See you<br>next year",outS:"Keep building. We're here.",
     S:[
      {t:"stat",k:"You never stopped",l:"work sessions",n:D.sessions,u:"// sessions",c:"About "+D.avgPrompts+" messages per session on average."},
      {t:"stat",k:"You talked a lot",l:"messages you sent Claude",n:D.prompts,u:"// prompts",c:"Plus "+fmt(D.replies)+" replies back. A real conversation."},
      {t:"mile",k:"Milestone",b:"⚡",n:D.tools,h:"tool calls",s:"Across "+D.variety+" different tools. You used the whole box."},
      {t:"list",k:"Your tools",h:"Your most<br>worn-out tools",rows:D.topTools},
      {t:"mile",k:"Where you rank",b:"🔥",img:"fire",n:D.percentile,h:"top percentile",s:"By how much you used Claude Code — you're on fire. (estimate)"},
      {t:"list",k:"Projects",h:"Where the<br>energy went",rows:D.projects},
      {t:"stat",k:"Your busiest day",l:"your peak was on",head:D.busiest,n:D.busiestN,u:"// events in one day",c:"The day you just didn't stop."},
      {t:"mile",k:"Your type",kick:"your developer type this year",img:"clawd",h:PEN.h,s:PEN.s,chips:[PEN.c1,"#"+String(D.favModel).split(" ")[0],PEN.c2]},
      {t:"vs",k:"When you coded",h:"Weekday vs<br>weekend",a:["Weekday",D.weekdayPct],bb:["Weekend",D.weekendPct],s:"Code doesn't take days off — and neither do you."},
      {t:"list",k:"In the code",h:"Read ·<br>Edit · Write",rows:D.actions},
      {t:"stat",k:"Lost for words? Not you",l:"characters you typed",n:D.chars,u:"// characters",c:"Like "+D.novels+" novels. Longest message: "+fmt(D.longest)+" chars."},
      {t:"stat",k:"Big numbers",l:"tokens Claude wrote for you",big:D.outTok,u:"// tokens",c:D.totTok+" tokens processed in total this year."},
      {t:"mile",k:"You weren't alone",b:"🤖",n:D.agents,h:"sub-agents",s:"Plus "+fmt(D.mcp)+" calls to connected MCP tools."}
     ]}
  };
  var L=T[LANG]||T.he,RTL=(L.dir==="rtl"),N=L.S.length+2;
  root.style.setProperty('--fh',L.font);
  var card=document.getElementById('cw-card');card.dir=L.dir;card.style.fontFamily=L.font;card.setAttribute('aria-label',L.aria);
  function ix(i){return (i+1)+' / '+N;}
  function eb(k,i){return '<div class="cw-eb a1"><span class="cw-spark"></span> '+k+' <span class="cw-ix">'+ix(i)+'</span></div>';}
  function brand(){return '<div class="cw-brand"><span class="cw-dot"></span> claude code</div>';}
  function acc(p){return '<div class="cw-acc" data-px="'+p+'"><canvas></canvas></div>';}
  function clawd(w){return '<img class="cw-clawd a1" src="'+BASE+'clawd.webp" alt="Clawd" data-fb="🦞" onerror="cwfb(this)" style="width:'+(w||84)+'px">';}
  function fire(w){return '<img class="cw-fire a1" src="'+BASE+'fire.webp" alt="" data-fb="🔥" onerror="cwfb(this)" style="width:'+(w||80)+'px;height:'+(w||80)+'px">';}
  function bignum(v){var num=(typeof v==='number');var sm=String(fmt(v)).length>5?' sm':'';return '<div class="cw-big'+sm+' a2'+(num?' cw-cnt" data-to="'+v+'"':'"')+'>'+fmt(v)+'</div>';}
  var PX=['skyline','bars','dots'];
  function build(){
    var H=[];
    H.push({cls:'dark',px:'skyline',html:eb(L.introK,0)+'<div class="cw-in">'+clawd(80)+'<div class="cw-lbl a2" style="font-size:18px">'+L.introA+'</div><div class="cw-head a3" style="font-size:58px;color:var(--cream)">'+L.introH+'</div><div class="cw-sub a5">'+L.introB+'</div></div>'});
    L.S.forEach(function(s,k){
      var i=k+1,px=PX[k%3],inner='';
      if(s.t==='stat'){
        inner=eb(s.k,i)+'<div class="cw-in"><div class="cw-lbl a1">'+s.l+'</div>'+(s.head?'<div class="cw-head a2" style="font-size:34px;margin:2px 0">'+s.head+'</div>':'')+(s.big?'<div class="cw-big sm a2">'+s.big+'</div>':bignum(s.n))+'<div class="cw-unit a3">'+s.u+'</div>'+(s.c?'<div class="cw-ctx a4">'+s.c+'</div>':'')+'</div>';
      } else if(s.t==='mile'){
        inner=eb(s.k,i)+'<div class="cw-in">'+(function(){var v=s.img?(s.img==='clawd'?clawd(72):fire(84)):(s.b?'<div class="cw-badge a1">'+s.b+'</div>':'');return s.kick?v+'<div class="cw-lbl a1">'+s.kick+'</div>':v+bignum(s.n);})()+'<div class="cw-head a2" style="color:inherit;font-size:46px">'+s.h+'</div><div class="cw-sub a3">'+s.s+'</div>'+(s.chips?'<div class="cw-chips a4">'+s.chips.map(function(c){return '<span class="cw-chip">'+c+'</span>';}).join('')+'</div>':'')+'</div>';
      } else if(s.t==='list'){
        var r=s.rows.map(function(row,j){return '<div class="cw-rank'+(j===0?' top':'')+' a'+(j+2)+'"><span class="cw-rn">'+(j+1)+'</span><span class="cw-rnm">'+row[0]+'</span><span class="cw-rv">'+fmt(row[1])+'</span></div>';}).join('');
        inner=eb(s.k,i)+'<div class="cw-in"><div class="cw-head a1" style="font-size:34px;margin-bottom:6px">'+s.h+'</div><div class="cw-ranks">'+r+'</div></div>';
      } else if(s.t==='vs'){
        inner=eb(s.k,i)+'<div class="cw-in"><div class="cw-head a1" style="font-size:34px;margin-bottom:8px">'+s.h+'</div><div class="cw-vs"><div class="a2"><div class="cw-vsl"><span>'+s.a[0]+'</span><span>'+s.a[1]+'%</span></div><div class="cw-vsbar"><i data-w="'+s.a[1]+'"></i></div></div><div class="a3"><div class="cw-vsl"><span>'+s.bb[0]+'</span><span>'+s.bb[1]+'%</span></div><div class="cw-vsbar alt"><i data-w="'+s.bb[1]+'"></i></div></div></div><div class="cw-sub a4">'+s.s+'</div></div>';
      }
      H.push({cls:(s.t==='mile'?'dark':''),px:px,html:inner});
    });
    H.push({cls:'clay',px:'skyline',dur:99999,html:eb(L.recapK,N-1)+'<div class="cw-in"><div class="cw-head a1" style="color:var(--cream);font-size:48px">'+L.outH+'</div><div class="cw-sub a2" style="color:var(--cream);opacity:.92">'+L.outS+'</div><div class="cw-btns a3"><button class="cw-share" id="cw-copy">'+L.copy+'</button><button class="cw-b2" id="cw-img">'+L.img+'</button><button class="cw-b2" id="cw-replay">'+L.again+'</button></div></div>'});
    return H;
  }
  var SL=build();
  var stage=document.getElementById('cw-stage'),bx=document.getElementById('cw-bars'),hint=document.getElementById('cw-hint'),toast=document.getElementById('cw-toast');
  hint.textContent=L.hint;toast.textContent=L.copied;
  SL.forEach(function(s){
    var d=document.createElement('div');d.className='cw-slide '+(s.cls||'');d.innerHTML=acc(s.px)+s.html+brand();stage.appendChild(d);
    var seg=document.createElement('div');seg.className='cw-seg';seg.innerHTML='<i></i>';bx.appendChild(seg);
  });
  var slides=stage.querySelectorAll('.cw-slide'),segs=bx.querySelectorAll('.cw-seg');
  var nx=document.getElementById('cw-next'),pv=document.getElementById('cw-prev');
  if(RTL){nx.style.cssText='left:0;width:60%';pv.style.cssText='right:0;width:40%';}else{nx.style.cssText='right:0;width:60%';pv.style.cssText='left:0;width:40%';}
  var i=0,timer=null;
  var recap=(LANG==='he'?"✦ ה-Claude Wrapped שלי 2026:\n• "+D.sessions+" שיחות · "+D.prompts+" הודעות\n• "+fmt(D.tools)+" קריאות כלים — "+D.percentile+" העליונים\n• המודל: "+D.favModel+" · ינשוף לילה 🦉\n\n👉 נסה גם את ה-Wrapped שלך ב-Claude Code:\n/plugin marketplace add ARIKBAR/claude-code-wrapped\nואז: /wrapped\n#ClaudeWrapped":"✦ My Claude Wrapped 2026:\n• "+D.sessions+" sessions · "+D.prompts+" prompts\n• "+fmt(D.tools)+" tool calls — top "+D.percentile+"\n• Model: "+D.favModel+" · Night Owl 🦉\n\n👉 Try your own Wrapped in Claude Code:\n/plugin marketplace add ARIKBAR/claude-code-wrapped\nthen: /wrapped\n#ClaudeWrapped");
  function countUp(el){var to=+el.getAttribute('data-to');if(reduce){el.textContent=fmt(to);return;}var s=null;function stp(ts){if(s===null)s=ts;var p=Math.min(1,(ts-s)/820);el.textContent=fmt(Math.floor((1-Math.pow(1-p,3))*to));if(p<1)requestAnimationFrame(stp);else el.textContent=fmt(to);}el.textContent='0';requestAnimationFrame(stp);}
  function show(n){
    if(n<0)n=0;if(n>=SL.length)n=SL.length-1;i=n;
    slides.forEach(function(el,k){el.classList.toggle('on',k===i);});
    segs.forEach(function(sg,k){sg.classList.remove('active','done');var b=sg.firstChild;b.style.transition='none';b.style.width=k<i?'100%':'0';if(k<i)sg.classList.add('done');});
    void bx.offsetWidth;
    var dur=SL[i].dur||5200,cur=segs[i];cur.style.setProperty('--dur',dur+'ms');cur.classList.add('active');
    var last=(i===SL.length-1);hint.style.display=last?'none':'block';nx.style.pointerEvents=last?'none':'';pv.style.pointerEvents=last?'none':'';
    var s=slides[i];
    s.querySelectorAll('.cw-cnt').forEach(countUp);
    s.querySelectorAll('.cw-vsbar>i').forEach(function(b){b.style.width='0';void b.offsetWidth;b.style.width=b.getAttribute('data-w')+'%';});
    clearTimeout(timer);if(i<SL.length-1)timer=setTimeout(function(){show(i+1);},dur);
    wire();
  }
  function flash(m){toast.textContent=m;toast.classList.add('show');setTimeout(function(){toast.classList.remove('show');},1700);}
  function wire(){
    var c=document.getElementById('cw-copy');if(c)c.onclick=function(e){e.stopPropagation();try{navigator.clipboard.writeText(recap).then(function(){flash(L.copied);},function(){flash(L.copied);});}catch(_){flash(L.copied);}};
    var im=document.getElementById('cw-img');if(im)im.onclick=function(e){e.stopPropagation();if(window.sendPrompt)sendPrompt(LANG==='he'?'צור תמונת שיתוף של ה-Claude Wrapped שלי: '+D.sessions+' שיחות, '+D.tools+' קריאות כלים, '+D.percentile+' העליונים, '+D.favModel+', ינשוף לילה.':'Create a share image of my Claude Wrapped: '+D.sessions+' sessions, '+D.tools+' tool calls, top '+D.percentile+', '+D.favModel+', Night Owl.');else flash(L.copied);};
    var rp=document.getElementById('cw-replay');if(rp)rp.onclick=function(e){e.stopPropagation();show(0);};
  }
  nx.addEventListener('click',function(){show(i+1);});pv.addEventListener('click',function(){show(i-1);});
  document.addEventListener('keydown',function(e){var fwd=RTL?'ArrowLeft':'ArrowRight',bk=RTL?'ArrowRight':'ArrowLeft';if(e.key===fwd)show(i+1);else if(e.key===bk)show(i-1);});
  function pixel(){
    var PS=14,tl=['#EDE9DF','#E6DBCB','#E0C5B0','#D9A98C'],td=['#2b2823','#3a342c','#4a3a2e','#5e4636'],tc=['#B0593F','#bd6a4e','#c8775c','#d4886c'];
    document.querySelectorAll('.cw-acc').forEach(function(ac){
      var cv=ac.querySelector('canvas'),sl=ac.parentNode,dark=sl.classList.contains('dark'),clay=sl.classList.contains('clay');
      var cells=dark?td:(clay?tc:tl),p=ac.getAttribute('data-px'),ctx=cv.getContext('2d'),W=346,Hh=190;cv.width=W;cv.height=Hh;
      var cols=Math.ceil(W/PS),rows=Math.ceil(Hh/PS),hs=[];
      for(var c=0;c<cols;c++)hs.push(Math.floor(((Math.sin(c*0.55)*0.5+0.5)*0.6+(Math.sin(c*0.21+2)*0.5+0.5)*0.4)*rows*0.8)+1);
      var t=(cols*7%13);
      function fr(){requestAnimationFrame(fr);if(!sl.classList.contains('on'))return;t+=0.006;ctx.clearRect(0,0,W,Hh);
        for(var x=0;x<cols;x++)for(var y=0;y<rows;y++){var fb=rows-1-y,sh=false,tn=0;
          if(p==='skyline'){if(fb<hs[x]){sh=true;tn=fb/hs[x];if(hs[x]-1-fb<2)tn+=Math.sin(t*2+x)*0.15;}}
          else if(p==='bars'){if(x%3===0){var h=(Math.sin(t*0.8+x*0.5)*0.5+0.5)*rows*0.7+1;if(fb<h){sh=true;tn=fb/h;}}}
          else{var sd=Math.sin(x*12.9+y*78.2)*43758.5;sd-=Math.floor(sd);if(sd>0.84&&fb<rows*0.8){sh=true;tn=Math.sin(t*1.2+x*0.7+y*1.3)*0.5+0.5;}}
          if(sh){var ci=Math.floor(tn*cells.length);if(ci<0)ci=0;if(ci>cells.length-1)ci=cells.length-1;ctx.fillStyle=cells[ci];ctx.fillRect(x*PS,y*PS,PS-1,PS-1);}}
      }
      fr();
    });
  }
  show(0);if(!reduce)pixel();
})();

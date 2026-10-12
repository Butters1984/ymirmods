(() => {
  if (document.getElementById('ymir-squee')) return;
  const host = document.createElement('div'); host.id = 'ymir-squee'; document.body.append(host);
  const root = host.attachShadow({mode: 'open'});
  root.innerHTML = `<style>
  :host{position:fixed;right:22px;bottom:22px;z-index:2147483000;font:14px/1.5 system-ui;color:#eee6d8;color-scheme:dark}
  *{box-sizing:border-box}button,textarea{font:inherit}button{cursor:pointer;border:1px solid #b77a2c;background:#241b12;color:#ffd581;padding:9px 13px}button:hover{background:#3c2918;box-shadow:0 0 15px #df8a3344}button:focus-visible,textarea:focus-visible{outline:2px solid #ffd581;outline-offset:3px}button:disabled{opacity:.55;cursor:wait}
  #launch{position:relative;display:block;margin-left:auto;width:80px;height:80px;border:0;border-radius:50%;padding:0;background:transparent;box-shadow:none;isolation:isolate}
  #launch:hover{background:transparent;box-shadow:none}
  #avatar{display:block;width:100%;height:100%;object-fit:contain;animation:squee-float 4s ease-in-out infinite;filter:drop-shadow(0 0 8px #ed982944)}
  #avatar-wrap{display:block;width:100%;height:100%;transition:transform .22s ease,filter .22s ease;transform-origin:center}
  #launch:hover #avatar-wrap,#launch:focus-visible #avatar-wrap{transform:scale(1.12);filter:drop-shadow(0 0 12px #ffab4277)}
  #launch-label{position:absolute;right:calc(100% + 14px);top:50%;transform:translate(8px,-50%);opacity:0;pointer-events:none;white-space:nowrap;padding:8px 14px;border:1px solid #b77a2c;border-radius:8px;background:#11131bef;color:#ffda91;font-weight:700;box-shadow:0 6px 22px #0008;transition:opacity .2s ease,transform .2s ease}
  #launch:hover #launch-label,#launch:focus-visible #launch-label{opacity:1;transform:translate(0,-50%)}
  #launch[aria-expanded="true"] #avatar{animation-play-state:paused}
  @keyframes squee-float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
  @media(prefers-reduced-motion:reduce){#avatar{animation:none}#avatar-wrap,#launch-label{transition:none}}
  @media(hover:none){#launch-label{opacity:1;transform:translate(0,-50%)}}
  header .squee-head{width:40px;height:40px;object-fit:contain;flex-shrink:0}
  #panel{width:380px;max-width:calc(100vw - 32px);height:550px;max-height:calc(100dvh - 130px);background:radial-gradient(ellipse at top right,#35251544,transparent 65%),#0b0d14;border:1px solid #b77a2c;border-radius:16px;box-shadow:0 18px 65px #000b;margin-bottom:12px;display:flex;flex-direction:column;overflow:hidden}[hidden]{display:none!important}
  header{padding:15px;display:flex;gap:12px;align-items:center;border-bottom:1px solid #715027}header strong{color:#ffce78;font-size:19px}header small{display:block;color:#b7ad9b;font-size:12px}header div{flex:1}header button{padding:4px 9px}
  #log{flex:1;overflow:auto;padding:16px;overscroll-behavior:contain}.message{white-space:pre-wrap;overflow-wrap:anywhere;padding:10px 12px;background:#191a24;margin-bottom:12px;border-left:2px solid #a77734}.user{background:#332516;border-color:#ffcc71;margin-left:25px}.error{color:#ffc4ae}#status{padding:0 16px;color:#ddbc7e;min-height:22px;font-size:12px}form{padding:12px;border-top:1px solid #715027;display:flex;gap:8px}textarea{resize:none;flex:1;min-width:0;background:#11131b;color:#fff;border:1px solid #665031;padding:8px}footer{padding:0 12px 12px;color:#b7ad9b;font-size:11px}#suggestions{display:flex;gap:6px;padding:0 12px 10px;flex-wrap:wrap}#suggestions button{font-size:12px;padding:5px 8px}a{color:#ffd581}
  @media(max-width:480px){:host{right:16px;bottom:16px}#panel{width:calc(100vw - 32px)}}
  </style><section id="panel" aria-label="Chat with Squee" hidden><header><img class="squee-head" src="/squee-avatar.png" alt=""><div><strong>Squee</strong><small>Your friendly Valheim companion</small></div><button id="clear" aria-label="Clear conversation">↺</button><button id="close" aria-label="Close Squee">×</button></header><div id="log" role="log" aria-live="polite" aria-label="Conversation"></div><div id="suggestions"><button>Help me install mods</button><button>My mod isn't working</button></div><div id="status" role="status"></div><form><textarea rows="2" maxlength="3000" aria-label="Message Squee" placeholder="Ask Squee…" required></textarea><button id="send" type="submit">Send</button></form><footer>AI answers can be mistaken. Messages go to Cloudflare AI. Redact passwords and tokens from logs.</footer></section><button id="launch" aria-label="Ask Squee" aria-expanded="false" aria-controls="panel"><span id="avatar-wrap"><img id="avatar" src="/squee-avatar.png" alt="" width="80" height="80"></span><span id="launch-label" aria-hidden="true">Ask Squee</span></button>`;
  const $ = id => root.getElementById(id);
  const input = root.querySelector('textarea'); let history = [], busy = false;
  function add(content, type = '') {
    const el = document.createElement('div'); el.className = 'message ' + type;
    // Only link known local mod paths; render every other character as text.
    const pattern = /\/mod\/[a-zA-Z0-9_%.-]+/g; let start = 0;
    for (const match of content.matchAll(pattern)) {
      el.append(document.createTextNode(content.slice(start, match.index)));
      const a = document.createElement('a'); a.href = match[0]; a.textContent = match[0]; el.append(a); start = match.index + match[0].length;
    }
    el.append(document.createTextNode(content.slice(start))); $('log').append(el); $('log').scrollTop = $('log').scrollHeight;
  }
  const greet = () => add("Squee here! Need help with your mods, Viking? Ask away!"); greet();
  function open(value) { $('panel').hidden = !value; $('launch').setAttribute('aria-expanded', String(value)); if(value) input.focus(); else $('launch').focus(); }
  $('launch').onclick = () => open($('panel').hidden); $('close').onclick = () => open(false);
  root.addEventListener('keydown', e => {if(e.key === 'Escape') open(false);});
  $('clear').onclick = () => {if(busy) return;history=[];$('log').replaceChildren();$('status').textContent='';greet();};
  root.querySelectorAll('#suggestions button').forEach(b => b.onclick = () => {input.value=b.textContent;input.focus();});
  input.addEventListener('keydown', e => {if(e.key === 'Enter' && !e.shiftKey && !e.isComposing){e.preventDefault();root.querySelector('form').requestSubmit();}});
  root.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault(); const question = input.value.trim(); if(!question || busy) return;
    const outgoing = [...history.slice(-8), {role:'user',content:question}];
    add(question,'user'); input.value='';busy=true;$('send').disabled=true;$('clear').disabled=true;$('status').textContent='Squee is thinking…';
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(),45000);
    try {
      const response = await fetch('/api/squee/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:outgoing}),signal:controller.signal});
      const data = await response.json();if(!response.ok || typeof data.reply !== 'string') throw Error(data.error || 'Squee is unavailable. Please try again.');
      add(data.reply);history=[...outgoing,{role:'assistant',content:data.reply.slice(0,3000)}];
    } catch(error){add(error.name==='AbortError'?'Squee took too long. Please try again.':error.message,'error');if(!input.value)input.value=question;}
    finally{clearTimeout(timer);busy=false;$('send').disabled=false;$('clear').disabled=false;$('status').textContent='';if(!$('panel').hidden)input.focus();}
  });
})();

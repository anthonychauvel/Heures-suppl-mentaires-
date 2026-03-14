/**
 * Local Advisor — Conseiller basé sur 1000 scénarios locaux
 * Fonctionne sans clé API, sans internet, pour tous les utilisateurs
 */
(function(global){
'use strict';

class AIAdvisor {
  constructor(){
    this._modal   = document.getElementById('ai-modal');
    this._content = document.getElementById('ai-content');
    this._close   = document.getElementById('ai-close');
    this._history = [];
    if(this._close) this._close.addEventListener('click', ()=>this.close());
    if(this._modal) this._modal.querySelector('.modal-overlay').addEventListener('click', ()=>this.close());
  }

  open(){
    this._history = [];
    this._render();
    if(this._modal) this._modal.classList.remove('hidden');
  }

  close(){
    if(this._modal) this._modal.classList.add('hidden');
  }

  _render(){
    const state = window.DTE && window.DTE.engine ? window.DTE.engine.getState() : null;
    const advisor = window.DTE && window.DTE.scenarioAdvisor;
    const top5 = advisor && state ? advisor.match(state, 5) : [];
    const daily = advisor && state ? advisor.dailyScenario(state) : null;
    const stats = advisor ? advisor.stats() : null;

    this._content.innerHTML = `
      <div class="ai-chat">
        <!-- Info bandeau -->
        <div style="background:var(--cyan-dim);border:1px solid var(--border2);border-radius:var(--r);padding:8px 12px;margin-bottom:10px;font-family:var(--font-mono);font-size:10px;color:var(--cyan);">
          &#9670; ${stats ? stats.total : 0} scénarios locaux — Fonctionne hors ligne — Personnalisé sur votre état actuel
        </div>
        <!-- État résumé -->
        ${state ? `<div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
          ${[['Fatigue',state.scores.fatigue,'red'],['Stress',state.scores.stress,'amber'],['Perf.',state.scores.performance,'cyan']].map(([l,v,c])=>
            `<span style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:3px 8px;font-family:var(--font-mono);font-size:10px;">
              <span style="color:var(--${c})">${l} ${v}</span>
            </span>`).join('')}
        </div>` : ''}
        <!-- Messages -->
        <div class="ai-messages" id="ai-messages">
          <div class="ai-msg bot">
            <div class="ai-msg-avatar bot">&#129418;</div>
            <div class="ai-msg-bubble">
              Bonjour ! Je suis votre conseiller local — ${stats ? stats.total : 0} scénarios de prévention et droit du travail à votre disposition.<br><br>
              ${daily ? `<b>Conseil du jour :</b> <span style="color:var(--cyan)">${daily.titre}</span>` : ''}
              <br><br>Tapez votre question ou cliquez sur une suggestion ci-dessous.
            </div>
          </div>
        </div>
        <!-- Suggestions dynamiques -->
        <div class="ai-suggestions" id="ai-suggestions">
          ${top5.slice(0,4).map(s=>`<span class="ai-suggestion" data-id="${s.id}">${s.titre.substring(0,42)}...</span>`).join('')}
        </div>
        <!-- Mots-clés cliquables -->
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:7px;padding:6px 0;
          border-top:1px solid rgba(255,255,255,0.08);">
          <span style="font-family:var(--font-mono);font-size:8px;color:rgba(255,255,255,0.4);
            align-self:center;margin-right:3px;">RECHERCHER :</span>
          ${(()=>{
            const kws=['repos','contingent','stress','fatigue','HS nuit','arrêt','droit de retrait','burn-out','urgence','RCO','48h','pause','semaine'];
            return kws.map(kw=>'<span class="ai-kw-tag" data-kw="'+kw+'" style="font-family:var(--font-mono);font-size:9px;cursor:crosshair;border:1px solid rgba(0,200,255,0.2);padding:2px 7px;color:rgba(200,232,255,0.8);background:rgba(0,200,255,0.05);transition:all .15s;">'+kw+'</span>').join('');
          })()}
        </div>
        <!-- Barre de recherche -->
        <div class="ai-input-wrap">
          <input type="text" class="ai-input" id="ai-input"
            placeholder="Ex: repos compensateur, droit de retrait, HS nuit, burn-out..."
            maxlength="200" autocomplete="off">
          <button class="ai-send" id="ai-send">&#x27A4;</button>
        </div>
      </div>`;

    this._bindEvents(state);
  }

  _bindEvents(state){
    const input = document.getElementById('ai-input');
    // Tags mots-clés cliquables
    document.querySelectorAll('.ai-kw-tag').forEach(tag => {
      tag.addEventListener('mouseover', () => tag.style.background='rgba(0,200,255,0.14)');
      tag.addEventListener('mouseout',  () => tag.style.background='rgba(0,200,255,0.05)');
      tag.addEventListener('click', () => {
        if(input) input.value = tag.dataset.kw;
        this._query(tag.dataset.kw, state);
      });
    });
    const send  = document.getElementById('ai-send');
    if(send)  send.addEventListener('click', ()=>this._query(input ? input.value : '', state));
    if(input) input.addEventListener('keydown', e=>{ if(e.key==='Enter') this._query(input.value, state); });

    document.querySelectorAll('.ai-suggestion[data-id]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const id = parseInt(el.dataset.id);
        const advisor = window.DTE && window.DTE.scenarioAdvisor;
        if(!advisor) return;
        const s = advisor._db.find(sc=>sc.id===id);
        if(s) this._displayScenario(s, el.textContent.replace('...',''));
      });
    });
  }

  _query(query, state){
    const input = document.getElementById('ai-input');
    if(input) input.value = '';
    if(!query.trim()) return;

    this._addMsg(query, 'user');
    const advisor = window.DTE && window.DTE.scenarioAdvisor;
    if(!advisor){ this._addMsg('Moteur de scénarios non chargé.', 'bot'); return; }

    const results = advisor.search(query, state, 3);
    if(!results.length){
      this._addMsg('Aucun scénario correspondant trouvé. Essayez : "heures sup", "repos", "contingent", "stress", "fatigue", "arrêt"...', 'bot');
      return;
    }
    results.forEach((s,i)=>{ setTimeout(()=>this._displayScenario(s), i*120); });
  }

  _displayScenario(s, customTitle){
    const urgColors = ['var(--green)','var(--cyan)','var(--amber)','var(--red)'];
    const urgLabels = ['PRÉVENTION','INFO','ATTENTION','URGENT'];
    const c = urgColors[s.urgence] || urgColors[0];
    const lbl = urgLabels[s.urgence] || urgLabels[0];

    const html = `
      <div style="background:var(--surface);border:1px solid var(--border2);border-radius:var(--r-l);padding:var(--gap);margin-bottom:var(--gap-s);border-left:3px solid ${c};">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <b style="color:var(--text);font-family:var(--font-h);font-size:13px;">${s.titre}</b>
          <span style="font-family:var(--font-mono);font-size:9px;color:${c};border:1px solid ${c};border-radius:3px;padding:1px 5px;">${lbl}</span>
        </div>
        <p style="color:var(--text-dim);font-size:12px;margin-bottom:8px;line-height:1.55;">${s.message}</p>
        ${s.conseils.length ? `
          <div style="margin-bottom:8px;">
            <div style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);margin-bottom:4px;">ACTIONS</div>
            ${s.conseils.map(c=>`<div style="font-size:11px;color:var(--text-dim);padding:2px 0;display:flex;gap:6px;"><span style="color:var(--cyan);">&#x27A4;</span>${c}</div>`).join('')}
          </div>` : ''}
        ${s.refs.length ? `
          <div style="border-top:1px solid var(--border);padding-top:6px;margin-top:4px;">
            ${s.refs.map(r=>`<div style="font-family:var(--font-mono);font-size:9px;color:var(--text-muted);">&#9632; ${r}</div>`).join('')}
          </div>` : ''}
      </div>`;

    const container = document.getElementById('ai-messages');
    if(!container) return;
    const wrap = document.createElement('div');
    wrap.className = 'ai-msg bot anim-fade';
    wrap.innerHTML = `<div class="ai-msg-avatar bot">&#129418;</div><div class="ai-msg-bubble" style="max-width:90%;">${html}</div>`;
    container.appendChild(wrap);
    this._scrollBottom();
    this._history.push({ role:'assistant', titre: s.titre });
    this._updateSuggestions(s);
  }

  _addMsg(text, role){
    const container = document.getElementById('ai-messages');
    if(!container) return;
    const div = document.createElement('div');
    div.className = `ai-msg ${role} anim-fade`;
    div.innerHTML = `<div class="ai-msg-avatar ${role}">${role==='user'?'&#128100;':'&#129418;'}</div>
      <div class="ai-msg-bubble">${text}</div>`;
    container.appendChild(div);
    this._scrollBottom();
  }

  _updateSuggestions(lastScenario){
    const sugg = document.getElementById('ai-suggestions');
    if(!sugg) return;
    const state = window.DTE && window.DTE.engine ? window.DTE.engine.getState() : null;
    const advisor = window.DTE && window.DTE.scenarioAdvisor;
    if(!advisor || !state) return;
    const next = advisor.match(state, 8).filter(s=>s.id !== lastScenario.id).slice(0,4);
    sugg.innerHTML = next.map(s=>`<span class="ai-suggestion" data-id="${s.id}">${s.titre.substring(0,42)}...</span>`).join('');
    sugg.querySelectorAll('.ai-suggestion[data-id]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const id = parseInt(el.dataset.id);
        const s = advisor._db.find(sc=>sc.id===id);
        if(s) this._displayScenario(s);
      });
    });
  }

  _scrollBottom(){
    const c = document.getElementById('ai-messages');
    if(c) setTimeout(()=>c.scrollTop = c.scrollHeight, 50);
  }
}

global.AIAdvisor = AIAdvisor;
}(typeof window !== 'undefined' ? window : global));
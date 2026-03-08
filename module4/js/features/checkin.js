/**
 * Check-in quotidien — 5 questions, 2 minutes
 */
(function(global){
'use strict';

const QUESTIONS=[
  {id:'sleep',  text:'Comment avez-vous dormi cette nuit ?', emoji:'😴',
    opts:[{v:0,e:'😵',l:'Très mal (< 4h)'},{v:1,e:'😞',l:'Mal (4-5h)'},{v:2,e:'😐',l:'Moyen (6h)'},{v:3,e:'😊',l:'Bien (7h)'},{v:4,e:'😄',l:'Très bien (8h+)'}]},
  {id:'energy', text:'Quel est votre niveau d'énergie ce matin ?', emoji:'⚡',
    opts:[{v:0,e:'💀',l:'Épuisé'},{v:1,e:'😴',l:'Fatigué'},{v:2,e:'😐',l:'Neutre'},{v:3,e:'😊',l:'Energique'},{v:4,e:'🔥',l:'Excellent'}]},
  {id:'stress', text:'Quel est votre niveau de stress aujourd'hui ?', emoji:'😰',
    opts:[{v:0,e:'😌',l:'Aucun'},{v:1,e:'🙂',l:'Léger'},{v:2,e:'😐',l:'Modéré'},{v:3,e:'😟',l:'Élevé'},{v:4,e:'😱',l:'Critique'}]},
  {id:'pain',   text:'Ressentez-vous des douleurs physiques ?', emoji:'🩹',
    opts:[{v:0,e:'✅',l:'Aucune'},{v:1,e:'🟡',l:'Légère'},{v:2,e:'🟠',l:'Modérée'},{v:3,e:'🔴',l:'Forte'},{v:4,e:'🚨',l:'Intense'}]},
  {id:'motiv',  text:'Votre motivation pour travailler aujourd'hui ?', emoji:'🎯',
    opts:[{v:0,e:'😶',l:'Inexistante'},{v:1,e:'😕',l:'Basse'},{v:2,e:'😐',l:'Normale'},{v:3,e:'😊',l:'Bonne'},{v:4,e:'🚀',l:'Maximale'}]},
];

class Checkin {
  constructor(){
    this._modal=document.getElementById('checkin-modal');
    this._content=document.getElementById('checkin-content');
    this._close=document.getElementById('checkin-close');
    this._step=0;
    this._answers={};
    if(this._close) this._close.addEventListener('click',()=>this.close());
    if(this._modal) this._modal.querySelector('.modal-overlay').addEventListener('click',()=>this.close());
  }

  checkIfNeeded(){
    const today=new Date().toISOString().slice(0,10);
    const last=localStorage.getItem('DTE_CHECKIN_DATE');
    if(last!==today && new Date().getHours()>=6 && new Date().getHours()<=10){
      setTimeout(()=>this.open(),1200);
    }
  }

  open(){
    this._step=0;
    this._answers={};
    this._render();
    if(this._modal) this._modal.classList.remove('hidden');
  }

  close(){
    if(this._modal) this._modal.classList.add('hidden');
  }

  _render(){
    const q=QUESTIONS[this._step];
    const n=QUESTIONS.length;
    const dots=QUESTIONS.map((qq,i)=>`<span class="checkin-dot ${i<this._step?'done':i===this._step?'active':''}"></span>`).join('');
    this._content.innerHTML=`
      <div class="checkin-step">
        <div class="checkin-progress">${dots}</div>
        <div style="text-align:center;font-size:28px;margin-bottom:8px;">${q.emoji}</div>
        <div class="checkin-question">${q.text}</div>
        <div class="checkin-options">
          ${q.opts.map(o=>`
            <div class="checkin-option ${this._answers[q.id]===o.v?'selected':''}" data-val="${o.v}">
              <span class="checkin-option-emoji">${o.e}</span>
              <span>${o.l}</span>
            </div>`).join('')}
        </div>
        <div class="checkin-nav">
          ${this._step>0?`<button class="btn btn--ghost" id="ci-prev">← Précédent</button>`:'<span></span>'}
          <button class="btn btn--cyan" id="ci-next" ${this._answers[q.id]===undefined?'disabled style="opacity:.5;cursor:not-allowed;"':''}>
            ${this._step===n-1?'✅ Terminer':'Suivant →'}
          </button>
        </div>
      </div>`;

    this._content.querySelectorAll('.checkin-option').forEach(el=>{
      el.addEventListener('click',()=>{
        this._answers[q.id]=parseInt(el.dataset.val);
        this._render();
      });
    });
    const prev=document.getElementById('ci-prev');
    if(prev) prev.addEventListener('click',()=>{ this._step--; this._render(); });
    const next=document.getElementById('ci-next');
    if(next) next.addEventListener('click',()=>{
      if(this._answers[q.id]===undefined) return;
      if(this._step<n-1){ this._step++; this._render(); }
      else { this._submit(); }
    });
  }

  _submit(){
    const today=new Date().toISOString().slice(0,10);
    localStorage.setItem('DTE_CHECKIN_DATE',today);
    const history=JSON.parse(localStorage.getItem('DTE_CHECKIN_HISTORY')||'[]');
    history.push({date:today,...this._answers});
    if(history.length>90) history.shift();
    localStorage.setItem('DTE_CHECKIN_HISTORY',JSON.stringify(history));
    // Apply to analysis
    if(window.DTE&&window.DTE.learning&&window.DTE.engine){
      const st=window.DTE.engine.getState();
      if(st){
        window.DTE.learning.adaptFromCheckin(this._answers,st.scores);
        const newNorm=window.DTE.learning.applyCheckin(this._answers,st.norm);
        document.dispatchEvent(new CustomEvent('dte:checkin',{detail:{data:this._answers,norm:newNorm}}));
      }
    }
    this._content.innerHTML=`
      <div style="text-align:center;padding:var(--gap-xl);">
        <div style="font-size:48px;">🦊</div>
        <div style="font-family:var(--font-h);font-size:20px;font-weight:700;margin:var(--gap) 0;">Check-in enregistré !</div>
        <div style="color:var(--text-dim);font-size:13px;">Vos données ont été intégrées dans l'analyse.<br>Précision du modèle améliorée.</div>
        <div style="display:flex;justify-content:center;gap:var(--gap);margin-top:var(--gap-l);flex-wrap:wrap;">
          ${Object.entries(this._answers).map(([k,v])=>{
            const q=QUESTIONS.find(q=>q.id===k);
            const o=q?q.opts.find(o=>o.v===v):null;
            return `<span style="background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);padding:4px 10px;font-family:var(--font-mono);font-size:10px;">${q?q.emoji:''} ${o?o.e:''}</span>`;
          }).join('')}
        </div>
        <button class="btn btn--cyan" style="margin-top:var(--gap-l);" id="ci-done">Fermer</button>
      </div>`;
    document.getElementById('ci-done').addEventListener('click',()=>this.close());
    window.DTE&&window.DTE.notifications&&window.DTE.notifications.show('Check-in enregistré','ok','🦊',`Précision du modèle : ${window.DTE.learning?window.DTE.learning.accuracyScore():'-'}%`);
  }

  getLatest(){
    const h=JSON.parse(localStorage.getItem('DTE_CHECKIN_HISTORY')||'[]');
    return h.length?h[h.length-1]:null;
  }
}

global.Checkin=Checkin;
}(typeof window!=='undefined'?window:global));
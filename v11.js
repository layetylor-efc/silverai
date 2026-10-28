(()=>{'use strict';
const $=id=>document.getElementById(id);
const status=$('quick-status');
function tell(message){if(status)status.textContent=message;}
const prompt=$('demo-prompt');
const copy=$('copy-demo');
if(copy&&prompt)copy.addEventListener('click',async()=>{
  let ok=false;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(prompt.value);ok=true;}}catch(_){}
  if(!ok){prompt.focus();prompt.select();try{ok=document.execCommand('copy');}catch(_){}}
  tell(ok?'質問文をコピーしました。続いて「ChatGPTを開く」を押してください。':'質問文を選択しました。長押しでコピーしてください。');
});
for(const tab of document.querySelectorAll('.device-tab')){
  tab.addEventListener('click',()=>{
    const selected=tab.dataset.device;
    for(const t of document.querySelectorAll('.device-tab'))t.setAttribute('aria-selected',String(t===tab));
    for(const guide of document.querySelectorAll('.device-guide'))guide.hidden=guide.dataset.guide!==selected;
  });
}
const talk=$('read-aloud'), stop=$('stop-reading');
const speechSupported=typeof window.speechSynthesis!=='undefined'&&typeof window.SpeechSynthesisUtterance!=='undefined';
if(talk){talk.disabled=!speechSupported;talk.title=speechSupported?'3分体験の説明を読み上げます':'このブラウザーは読み上げに対応していません';
  talk.addEventListener('click',()=>{
    if(!speechSupported)return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance('はじめてのAI、まずは3分。1、質問文をコピーします。2、チャットGPTを開きます。3、質問文を入力するか、マイクで話しかけましょう。答えは間違うことがあります。大切な情報は必ず確認しましょう。');
    utterance.lang='ja-JP';utterance.rate=.88;utterance.onend=()=>tell('読み上げが終わりました。');
    utterance.onerror=()=>tell('読み上げができませんでした。画面の説明をご覧ください。');
    window.speechSynthesis.speak(utterance);tell('説明を読み上げています。');
  });
}
if(stop)stop.addEventListener('click',()=>{
  if(speechSupported)window.speechSynthesis.cancel();tell('読み上げを停止しました。');
});
const line=$('line-share');
if(line){const url=(location.protocol==='https:'||location.protocol==='http:')?location.href.split('#')[0]:'https://layetylor-efc.github.io/silverai/';
  line.href='https://social-plugins.line.me/lineit/share?url='+encodeURIComponent(url);
}
const progress=$('learning-progress'), progressText=$('progress-count'), bar=$('progress-fill');
const storageKey='silverai-v11-read';
let done=new Set();
try{const raw=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(raw))done=new Set(raw.filter(x=>Number.isInteger(x)&&x>=1&&x<=10));}catch(_){}
function updateProgress(){
  if(progressText)progressText.textContent='全10章のうち '+done.size+'章を学習済み';
  if(bar){bar.style.width=(done.size*10)+'%';bar.setAttribute('aria-valuenow',String(done.size));}
  for(const b of document.querySelectorAll('.read-chapter-button')){
    const yes=done.has(Number(b.dataset.read));b.setAttribute('aria-pressed',String(yes));
    b.textContent=yes?'✓ 読み終わりました（取り消す）':'✓ この章を読み終わった';
  }
}
for(const chapter of document.querySelectorAll('section.chapter[data-index]')){
  const idx=Number(chapter.dataset.index);
  if(!(idx>=1&&idx<=10))continue;
  const button=document.createElement('button');
  button.type='button';button.className='read-chapter-button';button.dataset.read=String(idx);
  button.addEventListener('click',()=>{
    if(done.has(idx))done.delete(idx);else done.add(idx);
    try{localStorage.setItem(storageKey,JSON.stringify([...done].sort((a,b)=>a-b)));}catch(_){}
    updateProgress();
  });
  const bottom=chapter.querySelector('.chapter-bottom');
  if(bottom)bottom.before(button);else chapter.append(button);
}
updateProgress();
if(progress&&!document.querySelectorAll('.read-chapter-button').length)progress.hidden=true;
// TOP: マウスとタッチ両方で移動でき、通常タップ・キーボード操作はページ先頭へ戻る
const floating=document.querySelector('.floating');
const topBtn=floating&&floating.querySelector('a[href="#top"]');
if(floating&&topBtn&&typeof window.PointerEvent!=='undefined'){
  const key='silverai-v11-top-pos';let initial=null, moved=false,preventClick=false;
  function clamp(x,y){const rect=floating.getBoundingClientRect();return [Math.max(6,Math.min(x,innerWidth-rect.width-6)),Math.max(6,Math.min(y,innerHeight-rect.height-6))];}
  function place(x,y){const [left,top]=clamp(x,y);floating.style.left=left+'px';floating.style.top=top+'px';floating.style.right='auto';floating.style.bottom='auto';}
  try{const p=JSON.parse(localStorage.getItem(key));if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y))place(p.x,p.y);}catch(_){}
  topBtn.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;const r=floating.getBoundingClientRect();
    initial={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};moved=false;
    topBtn.setPointerCapture(e.pointerId);
  });
  topBtn.addEventListener('pointermove',e=>{
    if(!initial||initial.id!==e.pointerId)return;
    const dx=e.clientX-initial.x,dy=e.clientY-initial.y;
    if(Math.abs(dx)+Math.abs(dy)>9)moved=true;
    if(moved)place(initial.left+dx,initial.top+dy);
  });
  function endDrag(e){
    if(!initial||initial.id!==e.pointerId)return;
    if(moved){preventClick=true;const r=floating.getBoundingClientRect();
      try{localStorage.setItem(key,JSON.stringify({x:r.left,y:r.top}));}catch(_){}
    }
    initial=null;
  }
  topBtn.addEventListener('pointerup',endDrag);
  topBtn.addEventListener('pointercancel',endDrag);
  topBtn.addEventListener('click',e=>{if(preventClick){e.preventDefault();preventClick=false;}},true);
  window.addEventListener('resize',()=>{if(floating.style.left)place(parseFloat(floating.style.left)||6,parseFloat(floating.style.top)||6);});
}
})();
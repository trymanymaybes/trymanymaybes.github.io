import {catalogueGroups,randomPair} from './possibility-model.mjs';
const $=id=>document.getElementById(id);
const region=$('possibility-preview');
function node(tag,text,className){const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;}
function link(label,path){const a=node('a',label);a.href=path;return a;}
function image(src,alt){const img=node('img');img.src=src;img.alt=alt;img.loading='lazy';return img;}
async function catalogue(path){const r=await fetch(path,{cache:'no-cache',credentials:'omit'});if(!r.ok)throw Error('Catalogue unavailable');return r.json();}
async function init(){
 const [challenges,examples]=await Promise.all([catalogue('challenge-catalogue.json'),catalogue('possibilities-catalogue.json')]);
 const groups=catalogueGroups(challenges,examples);
 let selected=randomPair(groups);
 if(!selected){$('possibility-loading').textContent='No illustrated examples are published yet. Explore the challenges or community contributions below.';return;}
 // Build the complete list from the same catalogue, including future challenge IDs.
 const list=document.querySelector('.challenge-galleries');
 const fragment=document.createDocumentFragment();
 for(const c of groups.filter(c=>c.examples.length)){
  const details=node('details',null,'challenge-gallery');details.id='challenge-'+c.id;
  const summary=node('summary');summary.append(node('span','Challenge '+c.id,'gallery-number'),node('h2',c.title),node('span',c.examples.length+' illustrative possibilities','gallery-count'));
  const content=node('div',null,'gallery-content');content.append(link('Read the challenge →',c.page),document.createTextNode(' · '),link('Watch videos →','gallery.html#videos-'+c.id));
  for(const e of c.examples){
   const article=node('article',null,'gallery-example');article.id=e.id;
   const a=link('',e.page);a.append(image(e.image,e.alt));
   const art=node('div',null,'art');art.append(a);
   const copy=node('div');
   const paragraphs=Array.isArray(e.details)&&e.details.length?e.details.filter(t=>typeof t==='string'):[e.explanation];
   for(const paragraph of paragraphs)copy.append(node('p',paragraph));
   if(!e.page.startsWith('gallery.html#'))copy.append(link('Explore this example →',e.page));
   const detail=node('div',null,'detail');detail.append(art,copy);article.append(node('h3',e.title),detail);content.append(article);
  }
  details.append(summary,content);fragment.append(details);
 }
 list.replaceChildren(fragment);
 document.dispatchEvent(new Event('mm-gallery-ready'));
 const input=$('possibility-number');input.max=Math.max(...groups.map(c=>Number(c.id)));
 function show(){
  const c=selected.challenge,e=c.examples[selected.index];
  $('possibility-challenge').textContent='Challenge '+c.id;
  $('possibility-title').textContent=c.title;
  $('possibility-prompt').textContent=c.description;
  let watch=$('possibility-watch');if(!watch){watch=link('Watch this challenge’s videos →','');watch.id='possibility-watch';$('possibility-explanation').after(watch);}watch.href='#videos-'+c.id;
  $('possibility-starter-link').href=c.page;
  $('possibility-starter-link').setAttribute('aria-label','Open Challenge '+c.id+': '+c.title);
  $('possibility-starter').src=c.image;$('possibility-starter').alt=c.alt;
  $('possibility-example-link').href=e.page;
  $('possibility-example-link').setAttribute('aria-label','Explore '+e.title);
  $('possibility-example').src=e.image;$('possibility-example').alt=e.alt;
  $('possibility-example-title').textContent=e.title;
  $('possibility-explanation').textContent=e.explanation;
  $('possibility-status').textContent='Example '+(selected.index+1)+' of '+c.examples.length;
  $('possibility-previous').disabled=$('possibility-next').disabled=c.examples.length<2;
  input.value=Number(c.id);$('possibility-message').textContent='';
 }
 function move(delta){selected.index=(selected.index+delta+selected.challenge.examples.length)%selected.challenge.examples.length;show();}
 $('possibility-previous').onclick=()=>move(-1);$('possibility-next').onclick=()=>move(1);
 $('possibility-random').onclick=()=>{selected=randomPair(groups,selected.challenge.id);show();};
 $('possibility-jump').onsubmit=event=>{
  event.preventDefault();if(!input.reportValidity())return;
  const c=groups.find(c=>Number(c.id)===input.valueAsNumber);
  if(!c){$('possibility-message').textContent='That challenge is not published yet.';return;}
  if(!c.examples.length){$('possibility-message').replaceChildren(document.createTextNode('Challenge '+c.id+' has no illustrated examples yet. '),link('Try the challenge →',c.page));return;}
  selected={challenge:c,index:0};show();
 };
 region.addEventListener('keydown',event=>{
  if(event.target.matches('input,select,textarea')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}
 });
 $('possibility-loading').hidden=true;$('possibility-content').hidden=false;show();
}
init().catch(()=>{$('possibility-loading').textContent='The preview is temporarily unavailable. Browse the examples below.';});


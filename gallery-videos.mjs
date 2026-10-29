import {videoGroups,embedURL} from './video-model.mjs';
const root=document.getElementById('challenge-videos');
const node=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
const link=(title,url)=>{const a=node('a',title);a.href=url;if(url.startsWith('https:'))a.rel='noopener noreferrer';return a;};
let active=null;
function stop(){if(!active)return;active.frame.remove();active.button.hidden=false;active.close.remove();active=null;}
function card(v,challengeId){
 const article=node('article',null,'video-card');article.append(node('h4',v.title),node('p',v.duration+' · '+(v.kind==='long'?'Full walkthrough':'Short'),'small'));
 const player=node('div',null,'video-player '+(v.kind==='short'?'video-portrait':'video-landscape'));
 const button=node('button','Load video: '+v.title,'video-load');button.type='button';
 button.addEventListener('click',()=>{
  stop();const frame=node('iframe');frame.src=embedURL(v.id);frame.title='Challenge '+challengeId+': '+v.title;frame.allow='encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';
  const close=node('button','Close video','video-close');close.type='button';close.addEventListener('click',()=>{stop();button.focus();});
  player.append(frame);player.after(close);button.hidden=true;active={frame,button,close};frame.focus();
 });
 player.append(button);article.append(player,link('Watch on YouTube ↗','https://www.youtube.com/watch?v='+v.id));return article;
}
function group(c){
 const details=node('details',null,'video-challenge');details.id='videos-'+c.id;
 const summary=node('summary','Challenge '+c.id+' · '+c.title);details.append(summary);
 details.addEventListener('toggle',()=>{if(!details.open&&active&&details.contains(active.frame))stop();});
 const content=node('div',null,'video-challenge-content');content.append(node('p',c.availability));
 for(const [kind,title] of [['long','Full-length video'],['short','Shorts']]){
  const heading=node('h3',title);heading.id='videos-'+c.id+'-'+kind;content.append(heading);
  const videos=c.videos.filter(v=>v.kind===kind);
  if(videos.length){const grid=node('div',null,'video-grid');for(const v of videos)grid.append(card(v,c.id));content.append(grid);}
  else content.append(node('p','No public '+(kind==='long'?'full-length video':'YouTube Shorts')+' yet.','video-empty'));
 }
 if(c.instagram.length){
  const social=node('details',null,'video-social');social.append(node('summary','Instagram reels ('+c.instagram.length+')'));
  social.append(node('p','Instagram may require sign-in or follower access.','small'));const list=node('ul');
  for(const v of c.instagram){const li=node('li');li.append(link(v.title+' ↗',v.url));list.append(li);}social.append(list);content.append(social);
 }
 content.append(link('Try Challenge '+c.id+' →',c.page));details.append(content);return details;
}
function reveal(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}if(!id.startsWith('videos-'))return;
 const target=document.getElementById(id),detail=target?.closest('.video-challenge');if(!detail)return;detail.open=true;requestAnimationFrame(()=>target.scrollIntoView({block:'start'}));
}
window.addEventListener('hashchange',reveal);reveal();
async function get(path){const r=await fetch(path,{cache:'no-cache',credentials:'omit'});if(!r.ok)throw Error('Unavailable');return r.json();}
async function init(){
 const [challenges,videos]=await Promise.all([get('challenge-catalogue.json'),get('video-catalogue.json')]);
 const groups=videoGroups(challenges,videos);if(!groups.length)throw Error('Empty catalogue');
 const frag=document.createDocumentFragment();for(const c of groups)frag.append(group(c));root.replaceChildren(frag);
 const jump=document.getElementById('video-challenge-select');for(const c of groups){const option=node('option','Challenge '+c.id+' · '+c.title);option.value=c.id;jump.append(option);}
 jump.addEventListener('change',()=>{if(jump.value)location.hash='videos-'+jump.value;});document.getElementById('video-jump').hidden=false;
 document.getElementById('video-updated').textContent='Video availability checked '+videos.verifiedAt+'.';reveal();
}
init().catch(()=>{document.getElementById('video-updated').textContent='Embedded players are temporarily unavailable. Use the video links below.';});

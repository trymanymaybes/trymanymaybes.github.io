// Only published, fully described local assets can enter the illustrative gallery.
export function localPath(value, image=false) {
 if (typeof value !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_./-]*(?:#[a-zA-Z0-9_-]+)?$/.test(value) || value.split('/').includes('..')) return false;
 return image ? /\.(svg|png|jpe?g|webp)$/.test(value) : /\.html(?:#[a-zA-Z0-9_-]+)?$/.test(value);
}
export function catalogueGroups(challenges, examples) {
 if (!Array.isArray(challenges?.items) || !Array.isArray(examples?.items)) throw Error('Invalid catalogue');
 const text=v=>typeof v==='string' && v.trim().length>0;
 const groups=challenges.items.filter(c=>/^\d+$/.test(c.id) && text(c.title) && text(c.alt) && text(c.description) && localPath(c.image,true) && localPath(c.page)).map(c=>({...c,examples:[]}));
 const map=new Map(groups.map(c=>[c.id,c])); const seen=new Set();
 for(const e of examples.items){
  if(e.published!==true || !/^[a-zA-Z0-9_-]+$/.test(e.id) || seen.has(e.id) || !map.has(e.challengeId) || ![e.title,e.alt,e.explanation].every(text) || !localPath(e.image,true) || !localPath(e.page))continue;
  seen.add(e.id); map.get(e.challengeId).examples.push(e);
 }
 return groups.sort((a,b)=>Number(a.id)-Number(b.id));
}
export function randomPair(groups, previousId=null, random=Math.random) {
 const eligible=groups.filter(c=>c.examples.length);
 const choices=eligible.length>1 ? eligible.filter(c=>c.id!==previousId) : eligible;
 if(!choices.length)return null;
 const challenge=choices[Math.floor(random()*choices.length)];
 return {challenge,index:Math.floor(random()*challenge.examples.length)};
}

// Public playback only. Never infer availability from a filename or an upload record.
const text=v=>typeof v==='string'&&v.trim().length>0;
export function youtubeId(id){return typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id);}
export function instagramURL(value){
 try {const u=new URL(value);return u.protocol==='https:'&&u.hostname==='www.instagram.com'&&!u.username&&!u.password&&/^\/(?:trymanymaybe\/)?(?:reel|p)\/[A-Za-z0-9_-]+\/$/.test(u.pathname)&&!u.search&&!u.hash;}catch{return false;}
}
export function videoGroups(challenges,catalogue){
 if(!Array.isArray(challenges?.items)||!Array.isArray(catalogue?.challenges)||catalogue.version!==1)throw Error('Invalid video catalogue');
 const seen=new Set(),seenReels=new Set();
 return challenges.items.filter(c=>/^\d+$/.test(c.id)&&text(c.title)&&/^challenge-\d+\.html$/.test(c.page)).map(c=>{
  const source=catalogue.challenges.find(v=>v.challengeId===c.id)||{};
  const videos=(Array.isArray(source.videos)?source.videos:[]).filter(v=>{
   if(v.visibility!=='public'||!youtubeId(v.id)||!['long','short'].includes(v.kind)||!text(v.title)||!text(v.duration)||seen.has(v.id))return false;
   seen.add(v.id);return true;
  });
  const instagram=(Array.isArray(source.instagram)?source.instagram:[]).filter(v=>{
   if(!text(v.title)||!instagramURL(v.url)||seenReels.has(v.url))return false;seenReels.add(v.url);return true;
  });
  return {...c,availability:text(source.availability)?source.availability:'No public videos are available for this challenge yet.',videos,instagram};
 }).sort((a,b)=>Number(a.id)-Number(b.id));
}
export function embedURL(id){if(!youtubeId(id))throw Error('Invalid video ID');return 'https://www.youtube-nocookie.com/embed/'+id+'?autoplay=0&rel=0&playsinline=1';}

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {videoGroups,embedURL,instagramURL} from '../video-model.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url)));
const challenges=read('challenge-catalogue.json'),videos=read('video-catalogue.json');
test('published inventory: eleven sections, twelve playable videos, distinct IDs',()=>{
 const groups=videoGroups(challenges,videos);assert.equal(groups.length,11);
 assert.equal(groups.flatMap(c=>c.videos).length,12);
 for(const id of ['06','11']){const c=groups.find(c=>c.id===id);assert.equal(c.videos.filter(v=>v.kind==='long').length,1);assert.equal(c.videos.filter(v=>v.kind==='short').length,5);}
 for(const c of groups.filter(c=>!['06','11'].includes(c.id)))assert.equal(c.videos.length,0);
});
test('private, duplicate and injected IDs never reach a player',()=>{
 const d=structuredClone(videos),c=d.challenges.find(c=>c.challengeId==='06'),v=c.videos[0];
 c.videos.push(v,{...v,id:'abcdefghijk',visibility:'private'},{...v,id:'abc\" onload=alert(1)'},{...v,id:'12345678901',kind:'unknown'});
 assert.equal(videoGroups(challenges,d).find(c=>c.id==='06').videos.length,6);
 assert.throws(()=>embedURL('../bad'));assert.ok(embedURL(v.id).startsWith('https://www.youtube-nocookie.com/embed/'));assert.ok(embedURL(v.id).includes('autoplay=0'));
});
test('Instagram allows only HTTPS reel/post paths',()=>{
 for(const u of ['javascript:alert(1)','https://www.instagram.com.evil.test/reel/abc/','https://user@www.instagram.com/reel/abc/','https://www.instagram.com/reel/abc/?redirect=evil','https://www.instagram.com/accounts/login/'])assert.equal(instagramURL(u),false);
 assert.equal(instagramURL('https://www.instagram.com/trymanymaybe/reel/abc_123/'),true);
});
test('future challenge gets a section without renderer changes',()=>{
 const c=structuredClone(challenges);c.items.push({id:'12',title:'Future challenge',page:'challenge-12.html'});
 const g=videoGroups(c,videos);assert.equal(g.at(-1).id,'12');assert.equal(g.at(-1).videos.length,0);
});
test('static fallback and challenge deep links cover the full catalogue',()=>{
 const html=fs.readFileSync(new URL('../gallery.html',import.meta.url),'utf8');
 for(const c of challenges.items){assert.ok(html.includes('id="videos-'+c.id+'"'));const page=fs.readFileSync(new URL('../'+c.page,import.meta.url),'utf8');assert.ok(page.includes('gallery.html#videos-'+c.id));}
 assert.equal((html.match(/id="videos-06"/g)||[]).length,1);assert.ok(html.includes('frame-src https://www.youtube-nocookie.com'));
 assert.ok(!html.includes('<iframe'));assert.ok(!html.includes('https://i.ytimg.com'));
});

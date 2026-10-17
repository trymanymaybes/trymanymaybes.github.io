import {MAX_CODE,validateDrawing} from './protocol.mjs';
export const challenges = Object.freeze({
  '01': {title:'01 · A few marks, many possibilities', image:'../starter.svg', width:800,height:600, prompt:'Explore an object, a place, or something happening.', page:'../challenge-01.html'},
  '03': {title:'03 · How big is this, really?',image:'../challenge-03-starter.svg',width:800,height:800,prompt:'Imagine the same four circles at a different scale.',page:'../challenge-03.html'},
  '04': {title:'04 · What happened here?',image:'../challenge-04-starter.svg',width:800,height:800,prompt:'Add clues that suggest a story.',page:'../challenge-04.html'},
  '05': {title:'05 · What connects them?',image:'../challenge-05-starter.svg',width:800,height:800,prompt:'Imagine a connection between the original marks.',page:'../challenge-05.html'},
  blank:{title:'Blank canvas · Anything goes',image:null,width:800,height:800,prompt:'No rules. See where your next line takes you.',page:null}
});
export const MAX_POINTS=50000, MAX_STROKES=2000, MAX_BYTES=8*1024*1024;
export function validateProject(data){
  const fail=()=>{throw new Error('This is not a supported Many Maybes project.');};
  if(!data || data.format!=='many-maybes-playground' || ![1,2].includes(data.version) || !Object.hasOwn(challenges,data.challenge) || !Array.isArray(data.strokes) || data.strokes.length>MAX_STROKES) fail();
  let count=0;
  const strokes=data.strokes.map(s=>{
    if(!s || !['pen','eraser'].includes(s.tool) || !/^#[0-9a-f]{6}$/i.test(s.color) || !Number.isFinite(s.size) || s.size<1 || s.size>48 || !Array.isArray(s.points) || !s.points.length) fail();
    count+=s.points.length; if(count>MAX_POINTS) fail();
    const points=s.points.map(p=>{if(!Array.isArray(p)||p.length!==2||!p.every(v=>Number.isFinite(v)&&v>=0&&v<=800))fail();return [...p];});
    return {tool:s.tool,color:s.color,size:s.size,points};
  });
  const result = {format:'many-maybes-playground',version:data.version,challenge:data.challenge,strokes};
  if(data.version===2){
    if(typeof data.code!=='string'||data.code.length>MAX_CODE)fail();
    result.code=data.code;result.drawing=validateDrawing(data.drawing);
  }
  return result;
}

import {MAX_CODE,validateDrawing} from './protocol.mjs';
export const challenges = Object.freeze({
  "01": {
    "title": "01 · A few marks, many possibilities",
    "image": "../playground/reference-marks/01.svg",
    "width": 800,
    "height": 600,
    "prompt": "Turn two unequal circles, an open arc and a detached stroke into an unexpected object, place or event. Keep every original mark visible and preserve their relative positions; imagine three meanings and develop your favourite.",
    "alt": "Four dark green marks: a larger circle at upper left, a smaller circle at lower right, an open curved arc below the larger circle, and a short diagonal stroke at upper right.",
    "page": "../challenge-01.html"
  },
  "02": {
    "title": "02 · The gap does the work",
    "image": "../playground/reference-marks/02.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep the two filled shapes in place and leave the central gap completely blank. Add clues on the shapes or outside the gap so the untouched space becomes the most important part of your picture.",
    "alt": "Two solid dark green shapes face each other. Their inner edges form a blank central gap that is narrow at the top and widens towards the bottom.",
    "page": "../challenge-02.html"
  },
  "03": {
    "title": "03 · How big is this, really?",
    "image": "../playground/reference-marks/03.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep the large circle and the three smaller circles inside it. Imagine a scene smaller than a fingernail, human-sized, or larger than a building; develop one using details that establish its scale.",
    "alt": "A large dark green circular outline encloses three smaller circles: one at upper left, the smallest at upper right, and the largest of the inner circles below the centre.",
    "page": "../challenge-03.html"
  },
  "04": {
    "title": "04 · What happened here?",
    "image": "../playground/reference-marks/04.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep the circle and five detached strokes. Add at least two visual clues that suggest what happened before this moment or what could happen next.",
    "alt": "A dark green circle sits below and to the right of centre. Five separate short strokes form a diagonal trail from the upper left towards the circle, stopping before its edge.",
    "page": "../challenge-04.html"
  },
  "05": {
    "title": "05 · What connects them?",
    "image": "../playground/reference-marks/05.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep both equal squares and their relative positions. Add at least two clues that reveal a relationship such as support, exchange, cause or comparison.",
    "alt": "Two equal dark green square outlines sit side by side at the same height, separated by a wide blank space.",
    "page": "../challenge-05.html"
  },
  "06": {
    "title": "06 · What is this made of?",
    "image": "../playground/reference-marks/06.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep the three wavy lines visible and in place. Imagine three materials, then suggest one with at least two visual clues without writing its name inside the picture.",
    "alt": "Three equally spaced dark green wavy lines run vertically side by side. They have the same length and repeat the same bends.",
    "page": "../challenge-06.html"
  },
  "07": {
    "title": "07 · Whose eyes are these?",
    "image": "../playground/reference-marks/07.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep the rectangle and two short parallel lines. Imagine the scene through an unusual observer’s eyes, then add clues that show where the observer is and what they can see.",
    "alt": "A wide rectangular outline sits above the centre. Two separate short horizontal lines, one above the other, sit below it, slightly to the right.",
    "page": "../challenge-07.html"
  },
  "08": {
    "title": "08 · What else could it do?",
    "image": "../playground/reference-marks/08.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep the spoon outline intact. Give it an unexpected job and add a setting that shows how it works; its new purpose must be something other than eating or serving food.",
    "alt": "A vertical spoon outline: an oval bowl at the top narrows into a long slim handle with a rounded bottom. The interior is blank.",
    "page": "../challenge-08.html"
  },
  "09": {
    "title": "09 · What’s missing?",
    "image": "../playground/reference-marks/09.svg",
    "width": 800,
    "height": 800,
    "prompt": "Keep the three incomplete outlines and their gaps. Add surrounding clues that suggest something absent or hidden, without drawing the missing thing or completing the outlines.",
    "alt": "Three incomplete outlines sit side by side: a circle open on its right, a square missing part of its top edge, and a triangle with a gap in its lower edge.",
    "page": "../challenge-09.html"
  },
  "10": {
    "title": "10 · Can both be true?",
    "image": "../playground/reference-marks/10.svg",
    "width": 800,
    "height": 800,
    "prompt": "Use the same circle, rectangle and short line in two separate pictures. Add different surroundings so the two versions support opposite readings, such as welcome and unwelcome, or help and obstacle.",
    "alt": "A circle at upper left, a tall rectangle at right, and a short horizontal line below the circle. All three marks are separate.",
    "page": "../challenge-10.html"
  },
  "blank": {
    "title": "Blank canvas · Anything goes",
    "image": null,
    "width": 800,
    "height": 800,
    "prompt": "No rules. See where your next line takes you.",
    "alt": "Blank drawing canvas.",
    "page": null
  },
  "11": {
    "title": "11 · Was that always there?",
    "image": "../playground/reference-marks/11.svg",
    "width": 800,
    "height": 800,
    "prompt": "Look once, note what stands out, then look again with a new cue. Afterwards, turn the same three arches into three different possibilities while keeping every original mark visible.",
    "alt": "Three equal dark green semicircular arches sit side by side at the same height, open at the bottom.",
    "page": "../challenge-11.html"
  }
});
export const MAX_POINTS=50000, MAX_STROKES=2000, MAX_BYTES=8*1024*1024;
export function validateProject(data){
  const fail=()=>{throw new Error('This is not a supported Many Maybes project.');};
  if(!data || data.format!=='many-maybes-playground' || ![1,2,3].includes(data.version) || !Object.hasOwn(challenges,data.challenge) || !Array.isArray(data.strokes) || data.strokes.length>MAX_STROKES) fail();
  let count=0;
  const strokes=data.strokes.map(s=>{
    if(!s || !['pen','eraser'].includes(s.tool) || !/^#[0-9a-f]{6}$/i.test(s.color) || !Number.isFinite(s.size) || s.size<1 || s.size>48 || !Array.isArray(s.points) || !s.points.length) fail();
    count+=s.points.length; if(count>MAX_POINTS) fail();
    const points=s.points.map(p=>{if(!Array.isArray(p)||p.length!==2||!p.every(v=>Number.isFinite(v)&&v>=0&&v<=800))fail();return [...p];});
    return {tool:s.tool,color:s.color,size:s.size,points};
  });
  const result = {format:'many-maybes-playground',version:data.version,challenge:data.challenge,strokes};
  if(data.version>=2){
    if(typeof data.code!=='string'||data.code.length>MAX_CODE)fail();
    result.code=data.code;result.drawing=validateDrawing(data.drawing);
  }
  if(data.version===3){if(typeof data.showStarter!=='boolean')fail();result.showStarter=data.showStarter;}
  return result;
}


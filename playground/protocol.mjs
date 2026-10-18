// The only drawing data accepted from a worker or project file.
export const MAX_CODE = 65536;
export const MAX_COMMANDS = 12000;
const color = value => typeof value === 'string' && /^(#[0-9a-f]{3}([0-9a-f]{3})?|[a-z]{1,24})$/i.test(value);
const finite = value => Number.isFinite(value) && Math.abs(value) <= 10000;
export function validateDrawing(input) {
  if (!Array.isArray(input) || input.length > MAX_COMMANDS) throw new Error('Too many turtle drawing commands.');
  let vertices = 0;
  return input.map(c => {
    if (c?.kind === 'background') {
      if (!color(c.color)) throw new Error('Invalid background colour.');
      return {kind:'background',color:c.color};
    }
    if (c?.kind === 'world') {
      if (!Array.isArray(c.bounds) || c.bounds.length !== 4 || !c.bounds.every(finite) || c.bounds[2] <= c.bounds[0] || c.bounds[3] <= c.bounds[1]) throw new Error('Invalid world coordinates.');
      return {kind:'world',bounds:[...c.bounds]};
    }
    if (!c || !['line','fill','dot','text'].includes(c.kind) || !color(c.color)) throw new Error('Invalid turtle drawing output.');
    if (c.kind === 'line' || c.kind === 'fill') {
      if (!Array.isArray(c.points) || c.points.length < 2 || (vertices += c.points.length) > 100000 || !c.points.every(p => Array.isArray(p) && p.length === 2 && p.every(finite))) throw new Error('Invalid or excessive turtle geometry.');
      if (!Number.isFinite(c.width) || c.width < 0.1 || c.width > 100) throw new Error('Invalid turtle pen width.');
      return {kind:c.kind,color:c.color,width:c.width,points:c.points.map(p => [...p])};
    }
    if (!finite(c.x) || !finite(c.y) || !Number.isFinite(c.size) || c.size < 1 || c.size > 200) throw new Error('Invalid turtle mark.');
    if (c.kind === 'text') {
      if (typeof c.text !== 'string' || c.text.length > 500 || !['left','center','right'].includes(c.align)) throw new Error('Invalid turtle text.');
      const family=c.family??'sans-serif',style=c.style??'normal';
      if (typeof family!=='string' || !/^[a-zA-Z][a-zA-Z0-9 -]{0,63}$/.test(family) || typeof style!=='string' || !/^(normal|bold|italic|bold italic|italic bold)$/.test(style)) throw new Error('Invalid turtle font.');
      return {kind:c.kind,color:c.color,x:c.x,y:c.y,size:c.size,text:c.text,align:c.align,family,style};
    }
    return {kind:c.kind,color:c.color,x:c.x,y:c.y,size:c.size};
  });
}


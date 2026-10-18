// Test-only replay of the authoritative SVG primitives, not recovered Python source.
export const artworkNames=['03-lake','03-micro','03-orbit','04-cup','04-demolition','04-snail','05-bridge','05-conversation','05-studio'];
const decode=s=>s.replace(/&(?:amp|lt|gt|quot|apos);/g,x=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[x]));
export function artworkCommands(svg){
 const commands=[{kind:'world',bounds:[0,-800,800,0]}];
 for(const m of svg.matchAll(/<(rect|polyline|polygon|text)\b([^>]*?)(?:\/>|>([^<]*)<\/text>)/g)){
  const a=Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],decode(x[2])]));
  if(m[1]==='rect'){
   if(!['100%','800'].includes(a.width)||!['100%','800'].includes(a.height))throw Error('Unexpected reference rectangle');
   commands.push({kind:'background',color:a.fill});
  }else if(m[1]==='text')commands.push({kind:'text',x:Number(a.x),y:-Number(a.y),text:decode(m[3]),size:Number(a['font-size']),color:a.fill,align:'left',family:a['font-family'].split(',')[0],style:a['font-weight']||'normal'});
  else commands.push({kind:m[1]==='polygon'?'fill':'line',points:a.points.trim().split(/\s+/).map(p=>{const [x,y]=p.split(',').map(Number);return [x,-y];}),color:a.stroke||a.fill,width:Number(a['stroke-width']||1)});
 }
 const primitives=[...svg.matchAll(/<(?:rect|polyline|polygon|text)\b/g)].length;
 if(commands.length!==primitives+1)throw Error('Incomplete SVG replay');
 return commands;
}

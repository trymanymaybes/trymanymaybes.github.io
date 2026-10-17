import vm from 'node:vm';
import fs from 'node:fs';
const root = new URL('../',import.meta.url);
const sources=['vendor/skulpt.min.js','vendor/skulpt-stdlib.js','runtime-core.js'].map(p=>fs.readFileSync(new URL(p,root),'utf8'));
const turtle=fs.readFileSync(new URL('turtle.py',root),'utf8');
export async function execute(source) {
  const context=vm.createContext({console,setTimeout,clearTimeout,setImmediate,TextEncoder,TextDecoder});
  for(const source of sources)vm.runInContext(source,context);
  context.source=source;context.turtle=turtle;
  try { return JSON.parse(JSON.stringify(await vm.runInContext('runTurtle(source,turtle)',context,{timeout:6000}))); } catch(e) { throw new Error(String(e)); }
}
if(process.argv[2]) console.log(await execute(process.argv[2]));

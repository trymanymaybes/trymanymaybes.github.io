import {MAX_CODE, validateDrawing} from './protocol.mjs';
let bundlePromise;
async function bundle() {
  if (!bundlePromise) bundlePromise = Promise.all(['vendor/skulpt.min.js','vendor/skulpt-stdlib.js','runtime-core.js','turtle.py'].map(async path => {
    const r = await fetch(new URL(path,import.meta.url),{credentials:'omit',cache:'force-cache'});
    if (!r.ok) throw new Error('Could not load the Python runtime. Check your connection and try again.');
    return r.text();
  })).catch(e => { bundlePromise=null; throw e; });
  return bundlePromise;
}
// User code is sent as structured data over a private MessageChannel.
// The iframe has an opaque origin. Its blob worker inherits the no-network CSP.
export function createRunner() {
  let cancel = null;
  return {
    stop() { cancel?.(); },
    async run(source) {
      cancel?.();
      if (typeof source !== 'string' || source.length > MAX_CODE) throw new Error('Scripts must be at most 64 KB.');
      let canceled = false;
      cancel = () => { canceled = true; };
      const [runtime,stdlib,core,turtleModule] = await bundle();
      if (canceled) throw new Error('Stopped.');
      // Python source never enters this JS string.
      const workerSource = runtime + '\n' + stdlib + '\n' + core + '\n' +
        'onmessage = async e => { try { const result = await runTurtle(e.data.source,' + JSON.stringify(turtleModule) + '); postMessage(result); } catch(e) { postMessage({error:String(e).slice(0,2000)}); } };';
      return new Promise((resolve,reject) => {
        const frame = document.createElement('iframe');
        frame.hidden=true;frame.title='Isolated Python drawing runner';frame.setAttribute('sandbox','allow-scripts');
        frame.setAttribute('referrerpolicy','no-referrer');
        const channel = new MessageChannel();
        let settled=false,started=false;
        const finish = (error,value) => {
          if(settled)return;settled=true;clearTimeout(timer);window.removeEventListener('message',ready);
          channel.port1.close();channel.port2.close();frame.remove();cancel=null;
          error ? reject(error) : resolve(value);
        };
        const ready = e => {
          if (started || e.source !== frame.contentWindow || e.origin !== 'null' || e.data !== 'many-maybes-runner-ready') return;
          started=true;
          frame.contentWindow.postMessage({worker:workerSource,source},'*',[channel.port2]);
        };
        const timer=setTimeout(()=>finish(new Error('Runner timed out. Try a smaller script or open this page in a current browser.')),8000);
        cancel=()=>finish(new Error('Stopped. Your previous drawing was kept.'));
        channel.port1.onmessage=e=>{
          try {
            if(typeof e.data?.error==='string') throw new Error(e.data.error.slice(0,2000));
            const commands=validateDrawing(e.data?.commands);
            if(typeof e.data.output!=='string'||e.data.output.length>4000)throw new Error('Invalid runner response.');
            finish(null,{commands,output:e.data.output});
          } catch(error) { finish(error); }
        };
        window.addEventListener('message',ready);
        frame.src=new URL('sandbox.html',import.meta.url).href;
        document.body.append(frame);
      });
    }
  };
}

// Test-only static server. Never used for production execution.
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve('../..');let probes=0;
const handler=async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1');
 if(url.pathname==='/__probe'){probes++;res.end('probe');return;}
 if(url.pathname==='/__probes'){res.end(String(probes));return;}
 try{
  let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+path.sep))throw Error();
  if((await fs.stat(file)).isDirectory())file=path.join(file,'index.html');
  const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.json':'application/json'};
  res.setHeader('Content-Type',types[path.extname(file)]||'text/plain');res.end(await fs.readFile(file));
 }catch{res.statusCode=404;res.end('Not found');}
};
const server=http.createServer(handler);
server.on('upgrade',(req,socket)=>{probes++;const accept=createHash('sha1').update(req.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');socket.on('data',()=>socket.destroy());});
const certDir=await fs.mkdtemp(path.join(os.tmpdir(),'many-maybes-test-tls-'));
execFileSync('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout',path.join(certDir,'key.pem'),'-out',path.join(certDir,'cert.pem'),'-days','1','-subj','/CN=localhost','-addext','subjectAltName=IP:127.0.0.1,DNS:localhost'],{stdio:'ignore'});
const tls=https.createServer({key:await fs.readFile(path.join(certDir,'key.pem')),cert:await fs.readFile(path.join(certDir,'cert.pem'))},handler);
await fs.rm(certDir,{recursive:true,force:true});
tls.listen(4174,'127.0.0.1',()=>server.listen(4173,'127.0.0.1'));

"""Generate no-JavaScript video links; gallery also discovers catalogue additions at runtime."""
from pathlib import Path
import json, html, re
ROOT=Path(__file__).resolve().parents[1]
E=html.escape

def section(c,v):
 id=c['id'];videos=v.get('videos',[]);reels=v.get('instagram',[])
 s=f'<details class="video-challenge" id="videos-{id}"><summary>Challenge {id} · {E(c["title"])}</summary><div class="video-challenge-content"><p>{E(v.get("availability","No public videos are available for this challenge yet."))}</p>'
 for kind,title in [('long','Full-length video'),('short','Shorts')]:
  s+=f'<h3 id="videos-{id}-{kind}">{title}</h3>'
  matches=[x for x in videos if x['kind']==kind and x.get('visibility')=='public']
  if not matches:s+='<p>No public '+('full-length video' if kind=='long' else 'YouTube Shorts')+' yet.</p>'
  else:
   s+='<ul>'
   for x in matches:s+=f'<li><a href="https://www.youtube.com/watch?v={E(x["id"],quote=True)}" rel="noopener noreferrer">{E(x["title"])}</a> · {E(x["duration"])}</li>'
   s+='</ul>'
 if reels:
  s+='<h3>Instagram reels</h3><p class="small">Instagram may require sign-in or follower access.</p><ul>'
  for x in reels:s+=f'<li><a href="{E(x["url"],quote=True)}" rel="noopener noreferrer">{E(x["title"])}</a></li>'
  s+='</ul>'
 return s+f'<p><a href="{E(c["page"],quote=True)}">Try Challenge {id} →</a></p></div></details>'

def main():
 cat=json.loads((ROOT/'challenge-catalogue.json').read_text())['items']
 video=json.loads((ROOT/'video-catalogue.json').read_text());by={v['challengeId']:v for v in video['challenges']}
 p=ROOT/'gallery.html';s=p.read_text();generated=''.join(section(c,by.get(c['id'],{})) for c in cat)
 s=re.sub(r'<!-- VIDEO FALLBACK START -->.*?<!-- VIDEO FALLBACK END -->','<!-- VIDEO FALLBACK START -->'+generated+'<!-- VIDEO FALLBACK END -->',s,flags=re.S);p.write_text(s)
 for c in cat:
  p=ROOT/c['page'];s=p.read_text();id=c['id'];v=by.get(id,{})
  body=f'<section class="challenge-video-links" aria-labelledby="watch-videos-title"><h2 id="watch-videos-title">Watch this challenge</h2><p>{E(v.get("availability","No public videos are available for this challenge yet."))}</p><div class="buttons"><a class="btn light" href="gallery.html#videos-{id}">Videos &amp; short reels</a>'
  if any(x['kind']=='long' for x in v.get('videos',[])):body+=f'<a class="btn light" href="gallery.html#videos-{id}-long">Full-length video</a>'
  if any(x['kind']=='short' for x in v.get('videos',[])):body+=f'<a class="btn light" href="gallery.html#videos-{id}-short">Watch Shorts</a>'
  body+='</div></section>'
  if '<!-- CHALLENGE VIDEOS START -->' in s:s=re.sub(r'<!-- CHALLENGE VIDEOS START -->.*?<!-- CHALLENGE VIDEOS END -->','<!-- CHALLENGE VIDEOS START -->'+body+'<!-- CHALLENGE VIDEOS END -->',s,flags=re.S)
  else:s=s.replace('</main>','<!-- CHALLENGE VIDEOS START -->'+body+'<!-- CHALLENGE VIDEOS END --></main>')
  p.write_text(s)
if __name__=='__main__':main()

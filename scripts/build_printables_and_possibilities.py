"""Rebuild missing print sheets and exact-mark vector interpretations. Requires reportlab, svglib, qrcode."""
from pathlib import Path
import json, re, html, io
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
import qrcode
ROOT=Path(__file__).resolve().parents[1]
BASE='https://trymanymaybes.github.io/'
cat=json.loads((ROOT/'challenge-catalogue.json').read_text())
cs={c['id']:c for c in cat['items']}
style=ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=14,textColor=HexColor('#234b43'))
def para(c,text,y,width=507,x=44):
 p=Paragraph(html.escape(text.replace('’',"'")),style);_,h=p.wrap(width,400);p.drawOn(c,x,y-h);return y-h-9
for id in ['02','07','08','09','10']:
 d=cs[id];url=BASE+'submit.html?challenge='+id
 qr=qrcode.make(url);qr.save(ROOT/f'challenge-{id}-qr.png')
 c=canvas.Canvas(str(ROOT/f'challenge-{id}.pdf'),pagesize=(595.28,841.89),invariant=1)
 c.setTitle('Many Maybes / Challenge '+id+' / '+d['title']);c.setAuthor('Many Maybes')
 c.setFillColor(HexColor('#234b43'));c.setFont('Helvetica-Bold',10);c.drawString(44,802,'MANY MAYBES / CHALLENGE '+id)
 c.setFont('Helvetica-Bold',25);c.drawString(44,766,d['title'].replace('’',"'"))
 y=para(c,d['description'],745)
 y=para(c,'Keep every original mark visible and in the same relative position. Rotate or uniformly resize the whole starter only.',y)
 if id=='02': y=para(c,'Leave the central gap completely blank. Add details on the shapes or outside the gap.',y)
 if id=='09': y=para(c,'Keep all three gaps open. Do not draw the missing thing or complete the outlines.',y)
 if id=='10': y=para(c,'Use the second sheet for your opposite interpretation. Keep the starter identical in both.',y)
 else: y=para(c,'Imagine three ideas, then develop one. Rough sketches and written ideas are welcome.',y)
 drawing=svg2rlg(str(ROOT/d['image']));scale=390/drawing.width;drawing.scale(scale,scale)
 renderPDF.draw(drawing,c,102,200)
 para(c,'Reflect: '+d['reflection'],181)
 c.setFont('Helvetica',9);c.drawString(44,100,'Scan to share a drawing or text interpretation.');c.drawString(44,85,'Sign in to submit for review. Sharing is optional.')
 c.drawString(44,65,url);c.linkURL(url,(44,58,440,78),relative=0)
 c.drawImage(str(ROOT/f'challenge-{id}-qr.png'),465,51,width=80,height=80)
 c.setFont('Helvetica',8);c.drawString(44,30,'One start. Many possibilities. | Print A4 at actual size or fit to page.');c.showPage()
 c.setFillColor(HexColor('#234b43'));c.setFont('Helvetica-Bold',20);c.drawString(44,790,'Another possibility' if id!='10' else 'The opposite interpretation')
 para(c,'Challenge '+id+' / '+d['title'],770)
 renderPDF.draw(drawing,c,102,300)
 para(c,'My first assumption:',270);para(c,'What changed when I looked again?',180)
 para(c,'Starter description: '+d['alt'],95)
 c.setFont('Helvetica',8);c.drawString(44,30,BASE+d['page']);c.linkURL(BASE+d['page'],(44,25,500,42),relative=0);c.save()
 d['printable']=f'challenge-{id}.pdf'
for d in cat['items']:d['printable']=f"challenge-{d['id']}.pdf"
(ROOT/'challenge-catalogue.json').write_text(json.dumps(cat,indent=2,ensure_ascii=False)+'\n')
# The original group is inserted unchanged above the additional scene marks.
def starter(id):return re.search(r'(<g\b.*</g>)', (ROOT/cs[id]['image']).read_text(),re.S).group(1)
def path(d):return f'<path d="{d}"/>'
def circle(x,y,r):return f'<circle cx="{x}" cy="{y}" r="{r}"/>'
def rect(x,y,w,h):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}"/>'
def label(t,x,y,size=22):return f'<text x="{x}" y="{y}" fill="#234b43" stroke="none" font-family="sans-serif" font-size="{size}">{html.escape(t)}</text>'
def person(x,y):return circle(x,y,13)+path(f'M{x} {y+13}v60m-25 -35l25 12 25 -12m-25 35l-20 35m20 -35l20 35')
def scene(id,extra):return '<g fill="none" stroke="#a77945" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+extra+'</g>'+starter(id)
examples=[]
def add(id,key,title,alt,explanation,art):
 name=f'challenge-{id}-{key}'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-labelledby="title desc"><title>{html.escape(title)}</title><desc>{html.escape(alt)}</desc><rect width="800" height="800" fill="#faf7ef"/>{art}</svg>'
 (ROOT/(name+'.svg')).write_text(svg+'\n')
 examples.append(dict(id=name,challengeId=id,title=title,image=name+'.svg',alt=alt,explanation=explanation,page='gallery.html#'+name,published=True,details=['Thinking shift: '+explanation,'Reflect: '+cs[id]['reflection']]))
# 07: the rectangle and lines acquire meaning through the observer's position.
add('07','cat','A cat beneath the table','From floor level, a window frames a bird. The two short starter lines form the upper edges of two stacked books; table legs and cat ears frame the view.','Lower the observer to cat height. Table legs hide part of the room, while the bird outside becomes the centre of attention.',scene('07',path('M400 230v160M250 310h300M250 390l-65 70M550 390l65 70M100 160h600M130 160v500M670 160v500M420 470v25h80v-25M420 515v25h80v-25M90 720l15 -80 65 45M630 685l65 -45 15 80')+path('M310 280q20 -25 40 0q20 -25 40 0M80 690h640')))
add('07','diver','Looking out from underwater','A submerged observer sees a rectangular viewing window with fish beyond it. The two starter lines become the tops of ladder rungs, with rails extending down through bubbles.','Put the observer underwater. Bubbles and fish establish the medium; the ladder suggests a route to the surface.',scene('07',path('M395 415v220M525 415v220M420 470v10h80v-10M420 515v10h80v-10M290 300q35 -30 70 0q-35 30 -70 0l-20 -20v40zM450 345q25 -20 50 0q-25 20 -50 0')+''.join(circle(x,y,r) for x,y,r in [(170,580,18),(195,520,12),(175,465,7),(610,430,15),(630,360,9)])+path('M80 700q80 -100 120 0M650 710q-30 -100 30 -170')))
add('07','robot','A small robot approaches a charging dock','A robot camera view frames a rectangular charging panel. The two starter lines become charging contacts below it. Floor perspective lines lead towards the dock; battery and scan indicators frame the view.','Use a machine as the observer. A battery indicator and alignment guides make the same room a navigation task.',scene('07',path('M290 270h210v80H290zM330 310h130M390 290v40M420 470v10h80v-10M420 515v10h80v-10M200 680l150 -130M600 680l-80 -130M80 180v-50h50M670 130h50v50M80 620v50h50M670 670h50v-50')+rect(100,80,80,30)+rect(180,89,9,12)+label('LOW BATTERY',205,104,18)+label('ALIGN TO DOCK',280,730)))
# 08: intact spoon used for three non-food functions.
add('08','rain','A tiny rain gauge','An upright spoon catches falling raindrops. Measuring marks cross its bowl, and its handle is planted in a flower bed beside small seedlings.','A hollow bowl can collect rain. The planted handle anchors it, while level marks turn a utensil into a measuring instrument.',scene('08',path('M350 220h100M344 250h112M355 280h90M100 590q200 -30 600 0M200 590v-70m0 30q-40 -40 -50 -15m50 5q40 -40 50 -15M600 590v-90m0 40q-40 -40 -50 -15')+''.join(path(f'M{x} {y}l-10 25') for x,y in [(270,100),(390,80),(530,120),(600,250),(230,300)])+label('A garden rain gauge',220,700)))
add('08','signal','A reflector for a lost traveller','Sun rays strike the spoon bowl and reflect towards a distant rescue boat. A hand holds the long handle; hills and a waterline establish the outdoor setting.','A shiny surface can redirect light. Rays, a holding hand and a distant boat suggest signalling instead of eating.',scene('08',circle(150,100,40)+path('M180 130L370 210M190 110L380 195M430 220L670 360M440 235L680 375M630 400h110l-20 30h-70zM690 330v70M690 340l35 40h-35M80 440l100 -100 100 100M80 660q240 -30 640 0M360 550q-50 -40 -60 0l40 75 100 20 40 -75q-5 -30 -30 -10l-20 30')+label('A flash across the water',205,730)))
add('08','bell','A wind chime striker','A spoon hangs from a string between two suspended hollow tubes. Curved motion marks indicate that its bowl swings against the tubes; a breeze moves leaves nearby.','A hard surface can make sound. Suspension, nearby tubes and motion marks suggest a wind chime striker.',scene('08',path('M100 90h600M400 90v65M270 90v120M530 90v120M240 210h60v320h-60zM500 210h60v320h-60zM310 180q-50 65 0 130M490 180q50 65 0 130M100 400q50 -30 100 0M580 590q50 -30 100 0')+label('Let the breeze play',240,710)))
# 09: all gaps remain open; surrounding clues only.
add('09','museum','Three empty places in a museum','Three incomplete outlines sit on a museum display wall above empty label plates. A spotlight, a fallen hanging cord and a trail of footprints suggest that exhibits have been removed. No missing exhibit is drawn.','Absence can tell a story. Empty labels and footprints suggest removal, but do not prove whether this was a theft, a loan or a new exhibition.',scene('09',rect(110,170,600,390)+path('M400 100l-45 50h90zM375 155l-100 100M425 155l100 100M220 270l15 -40 20 30')+''.join(rect(x,490,90,20) for x in [180,360,550])+''.join(f'<ellipse cx="{x}" cy="{y}" rx="9" ry="17"/>' for x,y in [(540,620),(580,650),(620,680)])+label('What used to be here?',235,735)))
add('09','workshop','The tools have gone','Three incomplete outlines are surrounded by pegs on a workshop board. An open toolbox and dusty marks below the board suggest that objects once stored here are elsewhere. The gaps remain blank.','A storage outline is evidence of an absent object. Pegs and an open toolbox suggest use or relocation without showing the missing tools.',scene('09',rect(110,180,600,350)+''.join(circle(x,245,5) for x in [200,260,370,450,565,625])+path('M250 620h300v80H250zM250 620l50 -60h200l50 60M360 560v-20h80v20M160 575h40M180 590h30')+label('Borrowed? Moved? Forgotten?',180,750)))
add('09','dig','Traces at a dig','The three incomplete outlines lie within a marked excavation grid. A brush, numbered marker flags and scattered grains surround them; the missing parts are not filled in.','Treat the outlines as traces in the ground. Survey markers and a brush invite reconstruction, while several explanations remain possible.',scene('09',path('M110 220h600v330H110zM110 220l-30 -35M710 220l30 -35M110 550l-30 35M710 550l30 35M140 640l85 -65 25 30 -85 65zM225 575l35 -25 25 30 -35 25')+''.join(path(f'M{x} 290v-65h35l-35 30')+label(str(i),x+8,245,14) for i,x in enumerate([175,350,550],1))+''.join(circle(x,y,2) for x,y in [(180,470),(290,490),(500,480),(660,350),(310,330),(510,260)])+label('Evidence, not certainty',230,735)))
# 10: each example contains two identical starter copies, with different surrounding clues.
def pair(left,right,a,b):
 return '<g transform="translate(0 155) scale(.5)">'+scene('10',left)+'</g><g transform="translate(400 155) scale(.5)">'+scene('10',right)+'</g>'+label(a,35,120)+label(b,435,120)+path('M400 160v450')
add('10','door','Welcome / Keep out','Two panels repeat the same circle, tall rectangle and short line. In the left panel a smiling face, door handle, flowers and welcome mat invite entry. In the right, an angry face, door bars and warning sign discourage entry.','The unchanged shapes become a face, a door and a mat. Expression and access cues reverse the invitation.',pair(circle(260,275,4)+circle(300,275,4)+path('M250 305q30 30 60 0M550 365h-15M220 480v40h120v-40M100 550v-80')+circle(100,450,20),path('M250 270l20 10M290 280l20 -10M255 315q25 -20 50 0M480 300h80M480 360h80M480 420h80M220 480v40h120v-40')+label('STOP',225,510,20),'Welcome','Keep out'))
add('10','shade','Shelter / Obstruction','The same circle becomes the sun and the same rectangle a wall in two panels. On the left a seated person rests in the wall’s shaded area. On the right a walking person faces the wall blocking the route to a flag.','The wall can protect or obstruct. Heat and a resting figure make shade helpful; a destination beyond the wall makes it a barrier.',pair(path('M280 190v-25M190 285h-25M370 285h25M280 380v25M220 480v70M340 480v70M470 485l-120 100h220')+person(300,400),path('M220 480v70M340 480v70M630 485v-100h70l-70 35M80 590h640')+person(400,450),'Shelter','Obstruction'))
add('10','weather','A welcome rain / A ruined picnic','The same circle, rectangle and short line repeat in two scenes. Rain, seedlings and a water tank suggest relief for a dry garden on the left. Rain, a wet picnic table and a person seeking cover suggest disrupted plans on the right.','The weather is identical, but the goal changes. Rain helps the garden and spoils an outdoor meal; both readings can be true.',pair(path('M220 480v80M340 480v80M480 300h80M520 485v70M160 620v-60m0 30l-30 -20m30 20l30 -20M630 620v-60m0 30l-30 -20')+''.join(path(f'M{x} 140l-15 50') for x in [150,300,450,600]),path('M220 480v80M340 480v80M480 310h80M480 440h80M80 650h640')+person(390,510)+''.join(path(f'M{x} 140l-15 50') for x in [150,300,450,600]),'For the garden','For the picnic'))
p=json.loads((ROOT/'possibilities-catalogue.json').read_text());p['items']=[e for e in p['items'] if e['challengeId'] not in ['07','08','09','10']]+examples
(ROOT/'possibilities-catalogue.json').write_text(json.dumps(p,indent=2,ensure_ascii=False)+'\n')
# Links on each challenge page.
for id in ['02','07','08','09','10']:
 f=ROOT/f'challenge-{id}.html';s=f.read_text()
 if f'href="challenge-{id}.pdf"' not in s:
  s=s.replace('</main>',f'<section><h2>Try it on paper</h2><p>Two-page A4 worksheet with starter marks, reflection space and a QR code to share your interpretation.</p><a class="btn" href="challenge-{id}.pdf" download>Printable challenge PDF ↓</a></section></main>')
 if id!='02' and f'href="gallery.html#challenge-{id}"' not in s:
  s=s.replace('</main>',f'<section><h2>Try before you peek</h2><p>Imagine your own interpretation first, then explore three possibilities.</p><a class="btn light" href="gallery.html#challenge-{id}">Explore the possibilities</a></section></main>')
 f.write_text(s)
print('Built 5 two-page PDFs, 5 QR images, 12 illustrated examples and catalogue/page links.')

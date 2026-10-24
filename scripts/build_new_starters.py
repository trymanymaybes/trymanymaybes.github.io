from pathlib import Path
import json, math, html
root=Path(__file__).resolve().parents[1]
items=json.loads((root/"challenge-catalogue.json").read_text())["items"]
# Fixed geometry shared by the SVG and editable turtle starter.
rect=lambda x,y,w,h:[[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]]
arc=lambda x,y,r,start,end,n:[[round(x+r*math.cos(math.radians(start+(end-start)*j/n)),3),round(y+r*math.sin(math.radians(start+(end-start)*j/n)),3)] for j in range(n+1)]
spoon=[[round(400+65*math.cos(math.radians(a)),3),round(245+90*math.sin(math.radians(a)),3)] for a in range(75,466,3) if a<=285]
# Trace bowl from its lower right around its top to lower left, then the handle.
spoon=[[round(400+65*math.cos(math.radians(a)),3),round(245+90*math.sin(math.radians(a)),3)] for a in range(75,-256,-3)]
# End at lower left (105 degrees); smoothly join a narrow handle.
spoon += [[384,340],[384,570]]+arc(400,570,16,180,0,20)[1:]+[[416,340],spoon[0]]
shapes={
'07':[rect(250,230,300,160),[[420,470],[500,470]],[[420,515],[500,515]]],
'08':[spoon],
'09':[arc(230,370,65,40,320,80),[[385,305],[345,305],[345,435],[475,435],[475,305],[435,305]],[[585,435],[525,435],[590,305],[655,435],[615,435]]],
'10':[arc(280,285,65,0,360,100),rect(470,255,100,230),[[220,480],[340,480]]]
}
for key,paths in shapes.items():
 c=items[int(key)-1]
 svg='<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-labelledby="title desc"><title>'+html.escape(c['title'])+'</title><desc>'+html.escape(c['alt'])+'</desc><g fill="none" stroke="#234b43" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'
 svg+=''.join('<polyline points="'+' '.join(f'{x},{y}' for x,y in p)+'"/>' for p in paths)+'</g></svg>\n'
 (root/c['image']).write_text(svg)
 code='import turtle as t\nt.pencolor("#234b43")\nt.pensize(3)\n'
 for p in paths:
  code+=f'\nt.penup()\nt.goto({p[0][0]-400}, {400-p[0][1]})\nt.pendown()\n'
  for x,y in p[1:]:code+=f't.goto({round(x-400,3)}, {round(400-y,3)})\n'
 code+='\n# Add your own interpretation below.\n'
 c['code']=code

for c in items[6:]:
    (root / ("playground/examples/" + c["id"] + "-starter.py")).write_text(c["code"])

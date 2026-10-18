# Browser adapter for the existing Challenge 02 drawing functions.
import turtle
import math
BG='#faf7ef'; INK='#234b43'; MUTED='#56736c'
class Pen:
 def __init__(self):self.t=turtle.Turtle();self.stage='starter'
 def poly(self,pts,col=INK,fill=None,w=1):
  t=self.t;t.penup();t.goto(pts[0][0],-pts[0][1]);t.pencolor(col);t.pensize(w);t.pendown()
  if fill:t.fillcolor(fill);t.begin_fill()
  for x,y in pts[1:]+([pts[0]] if fill else []):t.goto(x,-y)
  if fill:t.end_fill()
  t.penup()
 def rect(self,x,y,w,h,col=INK,fill=None,lw=1):self.poly([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],col,fill,lw)
 def ellipse(self,x,y,rx,ry,col=INK,fill=None,w=1):self.poly([(x+rx*math.cos(i*math.pi/40),y+ry*math.sin(i*math.pi/40)) for i in range(81)],col,fill,w)
 def text(self,x,y,s,size=14,col=INK):
  t=self.t;t.penup();t.goto(x,-y);t.pencolor(col);t.write(s,font=('DejaVu Sans',size,'normal'))
turtle.bgcolor(BG)
turtle.setworldcoordinates(0,-800,800,0)
import math
LEFT=[(125,180),(390,180),(378,280),(352,365),(330,450),(285,570),(125,570)]
RIGHT=[(410,180),(675,180),(675,570),(530,570),(480,450),(453,365),(430,280)]
GAP=[(390,180),(410,180),(430,280),(453,365),(480,450),(530,570),(285,570),(330,450),(352,365),(378,280)]
GOLD='#c49b5a';LIGHT='#9ab2a1';PALE='#d9dfc8'
def base(p):
 p.stage='starter'
 for pts in (LEFT,RIGHT):p.poly(pts,INK,INK,1)
def heading(p,title,sub):
 p.stage='frame';p.text(44,42,'MANY MAYBES  /  CHALLENGE 02',13);p.text(44,88,title,30);p.text(44,120,sub,14,MUTED)
def footer(p,move,sub):
 p.stage='frame';p.poly([(44,695),(756,695)],'#d3d9cb');p.text(44,725,move,19);p.text(44,755,sub,13,MUTED);p.text(44,782,'One start. Many possibilities.  |  Illustrative example, not a correct answer.',11,MUTED)
def tree(p,x,y,r=9):
 p.ellipse(x+2,y+3,r+2,r+2,'#173e38','#173e38');p.ellipse(x,y,r,r,'#75977b','#75977b');p.ellipse(x-3,y-3,r*.45,r*.45,'#a5b58a','#a5b58a')
def house(p,x,y,w=28,h=19):
 p.rect(x+4,y+5,w,h,'#173e38','#173e38');p.rect(x,y,w,h,'#d6c59e','#d6c59e');p.poly([(x,y+h/2),(x+w,y+h/2)],'#aa8559',2 if False else None,1);p.rect(x+5,y+4,5,4,'#78978e','#78978e')
def starter():
 p=Pen();heading(p,'The gap does the work.','Make the untouched space the most important part of your picture.');base(p)
 p.stage='frame';p.text(125,615,'Two shapes. One untouched gap. What could the space become?',15);footer(p,'Look between the shapes.','Keep the gap blank. Build the meaning around it.');return p

def canyon():
 p=Pen();heading(p,'A route through the canyon','A change of scale turns blank paper into somewhere you could walk.');base(p)
 p.stage='01 / establish terrain'
 # Rock strata follow the outer edge of the protected route, never crossing it.
 for j in range(7):
  off=12+j*13
  p.poly([(382-off,194),(370-off,279),(344-off,363),(322-off,448),(277-off,558)],['#8ca587','#607f71','#b4b58f'][j%3],None,2)
  p.poly([(420+off,194),(440+off,279),(463+off,363),(490+off,448),(540+off,558)],['#8ca587','#607f71','#b4b58f'][j%3],None,2)
 p.stage='02 / human scale'
 for x,y,w,h in [(150,205,42,27),(205,220,30,23),(145,280,38,22),(180,338,36,25),(560,208,41,25),(614,248,31,22),(583,312,40,25),(600,382,35,25)]:house(p,x,y,w,h)
 # Roads connect the settlements on each plateau.
 for pts in [[(140,255),(206,267),(233,307),(224,380),(185,429),(155,500)],[(648,200),(640,301),(625,351),(651,435),(653,551)]]:
  p.poly(pts,'#acb8a2',None,8);p.poly(pts,'#e2d7b3',None,1)
 for x,y in [(152,391),(225,196),(270,210),(151,527),(230,471),(575,275),(654,342),(565,370),(620,510),(572,529)]:tree(p,x,y)
 p.stage='03 / evidence of a journey'
 # Tiny hikers approach the gap from the open foreground, outside its bounds.
 for x,y in [(368,619),(398,650)]:
  p.ellipse(x+5,y+12,10,3,'#d5c9b3','#d5c9b3');p.ellipse(x,y,3,3,GOLD,GOLD);p.poly([(x,y+4),(x,y+12)],INK,None,4);p.poly([(x,y+12),(x-4,y+19)],INK,None,2);p.poly([(x,y+12),(x+5,y+18)],INK,None,2);p.poly([(x+3,y+6),(x+9,y+15)],INK)
 for x,y in [(330,660),(356,643),(390,608),(412,592)]:p.ellipse(x,y,2,1,'#b6a68d','#b6a68d')
 # A trail marker is drawn, not used as the only explanation.
 p.poly([(290,610),(290,639)],GOLD,None,3);p.poly([(280,611),(306,611),(312,616),(306,621),(280,621)],GOLD,GOLD)
 footer(p,'Thinking move: change scale.','Roads, terraces and tiny walkers make the empty route feel enormous.');return p

def theatre():
 p=Pen();heading(p,'The light nobody drew','The same empty wedge becomes light because of what surrounds it.');base(p)
 p.stage='01 / curtains and rigging'
 # Fold lines stay on the original green shapes.
 for x in range(138,280,16):
  p.poly([(x,190),(x+4,285),(x-2,385),(x+3,470),(x,559)],'#597d6b',None,3)
 for x in range(545,668,16):p.poly([(x,190),(x-3,295),(x+3,393),(x-2,475),(x,559)],'#597d6b',None,3)
 p.poly([(110,166),(690,166)],INK,None,7)
 for x in range(130,680,36):p.ellipse(x,169,4,6,GOLD,None,2)
 p.stage='02 / a source of light'
 p.rect(374,135,52,18,INK,INK);p.poly([(382,153),(418,153),(411,174),(390,174)],INK,INK);p.ellipse(400,173,10,3,GOLD,GOLD)
 for x in [155,645]:
  p.poly([(x,150),(x,130)],INK,None,2);p.rect(x-10,145,20,12,INK,INK);p.ellipse(x,159,7,2,GOLD,GOLD)
 p.stage='03 / stage and audience'
 p.rect(125,576,550,13,'#aa8655','#d7bb88')
 for j in range(3):p.poly([(125,579+j*4),(675,579+j*4)],'#b99768',None,.8)
 # Pool and empty stool are below the original gap; nothing is painted into it.
 p.ellipse(407,602,105,11,'#dac394','#f1e6c9');p.ellipse(407,602,78,6,'#e5d4ad')
 p.ellipse(407,584,15,4,INK,INK)
 for dx in [-10,10]:p.poly([(407+dx,587),(407+dx*1.3,609)],INK,None,3)
 p.poly([(445,581),(445,611)],INK,None,2);p.ellipse(445,577,3,6,INK,INK);p.poly([(433,614),(457,614)],INK,None,2)
 for row,y in enumerate([636,662]):
  for x in range(150+row*8,670,37):
   p.ellipse(x,y-6,9,7,'#8c7867','#8c7867');p.rect(x-11,y,22,13,INK,INK);p.poly([(x-8,y+3),(x+8,y+3)],'#5e7b6b')
 footer(p,'Thinking move: change what “empty” means.','A lamp, curtains and an empty stage turn absence of ink into illumination.');return p

def photo():
 p=Pen();heading(p,'Someone was here','The gap becomes missing evidence, rather than a thing to name.');base(p)
 p.stage='01 / a photograph on a desk'
 # Surrounding paper corners support a missing photographic strip.
 for x in [119,681]:p.poly([(x,180),(x,576)],'#c6b79a',None,2)
 p.rect(119,574,562,43,'#d4c6a9','#f0e6d0');p.text(145,601,'SUMMER AT THE CONSERVATORY',12,'#7c7864')
 # Photo scenery stops at the torn inner boundaries.
 p.stage='02 / memories in the surviving pieces'
 for x in [145,185,225,265]:p.poly([(x,198),(x,410)],'#749581',None,2)
 for x in [550,590,630,660]:p.poly([(x,198),(x,410)],'#749581',None,2)
 for y in [230,285,340]:
  p.poly([(137,y),(270,y)],'#749581',None,2);p.poly([(540,y),(663,y)],'#749581',None,2)
 for x,y in [(155,392),(224,375),(590,386),(647,405)]:
  p.poly([(x-12,y),(x+12,y),(x+8,y+24),(x-8,y+24)],GOLD,GOLD)
  p.poly([(x,y),(x,y-62)],LIGHT,None,2)
  for k in range(4):
   yy=y-k*14
   p.ellipse(x-9,yy-9,10,4,LIGHT,LIGHT);p.ellipse(x+9,yy-16,10,4,PALE,PALE)
 # Two surviving hands and sleeves point toward the absent middle.
 p.poly([(179,460),(211,448),(260,482),(300,493),(289,519),(250,508),(201,491)],'#c6b58a','#c6b58a')
 p.poly([(627,458),(597,446),(553,477),(503,493),(516,520),(563,504),(611,491)],'#b6c4ad','#b6c4ad')
 p.ellipse(298,501,9,6,'#ddb48c','#ddb48c');p.ellipse(520,502,8,6,'#ddb48c','#ddb48c')
 for j in range(4):
  p.poly([(207+j*5,454),(193+j*5,482)],'#8d8065',None,1)
  p.poly([(610-j*5,451),(622-j*5,480)],'#718b7a',None,1)
 p.stage='03 / clues around the missing strip'
 # Tape at outer corners and a pencil on the desk.
 for x,y in [(110,173),(652,173)]:p.poly([(x,y),(x+36,y-6),(x+40,y+12),(x+4,y+18)],'#dfd0ad','#dfd0ad')
 p.poly([(541,636),(672,610),(678,617),(547,644)],GOLD,GOLD);p.poly([(541,636),(526,646),(547,644)],INK,INK)
 for x,y in [(152,638),(176,645),(203,635)]:p.poly([(x,y),(x+10,y-4),(x+7,y+7)],'#d1c3a7',None,1)
 p.poly([(303,645),(461,645)],'#d3c5a7',None,1);p.text(307,665,'What happened between them?',13,'#7c7864')
 footer(p,'Thinking move: infer a story from absence.','Hands, plants, tape and a damaged print invite several possible stories.');return p
DRAW={'starter':starter,'canyon':canyon,'theatre':theatre,'photograph':photo}

DRAW["canyon"]()

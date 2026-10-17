"""Many Maybes browser turtle: drawing only; no Tk, filesystem or network."""
import math

def _emit(command):
    __mm_emit(command)

def _number(value):
    value = float(value)
    if not math.isfinite(value) or abs(value) > 10000:
        raise ValueError('Use finite coordinates and angles between -10000 and 10000.')
    return value

_colormode = 1.0

def colormode(mode=None):
    global _colormode
    if mode is None:
        return _colormode
    if mode not in (1, 1.0, 255):
        raise ValueError('colormode must be 1.0 or 255')
    _colormode = mode

def _color(args):
    if len(args) == 1:
        if isinstance(args[0], str):
            return args[0]
        args = args[0]
    if len(args) != 3:
        raise ValueError('Use a colour name, hex colour, or RGB triple.')
    rgb = [int(round(float(v) * 255 / _colormode)) for v in args]
    if any(v < 0 or v > 255 for v in rgb):
        raise ValueError('RGB values are outside the current colormode.')
    return '#%02x%02x%02x' % tuple(rgb)

class Turtle:
    def __init__(self, *args, **kwargs):
        self._x = 0.0
        self._y = 0.0
        self._angle = 0.0
        self._down = True
        self._pen = '#233f36'
        self._fill = '#233f36'
        self._width = 2
        self._path = None
    def goto(self, x, y=None):
        if y is None:
            x, y = x
        x, y = _number(x), _number(y)
        if self._down:
            _emit({'kind':'line','points':[[self._x,self._y],[x,y]],'color':self._pen,'width':self._width})
        if self._path is not None:
            if len(self._path) >= 10000:
                raise ValueError('Fill path is too large.')
            self._path.append([x,y])
        self._x, self._y = x, y
    setpos = goto
    setposition = goto
    def forward(self, distance):
        distance = _number(distance)
        a = math.radians(self._angle)
        self.goto(self._x + math.cos(a)*distance, self._y + math.sin(a)*distance)
    fd = forward
    def backward(self, distance):
        self.forward(-distance)
    back = backward
    bk = backward
    def left(self, angle):
        self._angle = (self._angle + _number(angle)) % 360
    lt = left
    def right(self, angle):
        self.left(-angle)
    rt = right
    def setheading(self, angle):
        self._angle = _number(angle) % 360
    seth = setheading
    def heading(self):
        return self._angle
    def position(self):
        return (self._x,self._y)
    pos = position
    def xcor(self):
        return self._x
    def ycor(self):
        return self._y
    def setx(self, x):
        self.goto(x,self._y)
    def sety(self, y):
        self.goto(self._x,y)
    def home(self):
        self.goto(0,0)
        self.setheading(0)
    def penup(self):
        self._down = False
    pu = penup
    up = penup
    def pendown(self):
        self._down = True
    pd = pendown
    down = pendown
    def isdown(self):
        return self._down
    def pencolor(self, *args):
        if not args:
            return self._pen
        self._pen = _color(args)
    def fillcolor(self, *args):
        if not args:
            return self._fill
        self._fill = _color(args)
    def color(self, *args):
        if not args:
            return (self._pen,self._fill)
        if len(args) == 2:
            self.pencolor(args[0])
            self.fillcolor(args[1])
        else:
            self.pencolor(*args)
            self.fillcolor(*args)
    def pensize(self, value=None):
        if value is None:
            return self._width
        value = _number(value)
        if value < 0.1 or value > 100:
            raise ValueError('Pen width must be between 0.1 and 100.')
        self._width = value
    width = pensize
    def circle(self, radius, extent=None, steps=None):
        radius = _number(radius)
        extent = 360 if extent is None else _number(extent)
        steps = max(1,int(abs(extent)/3)+1) if steps is None else int(steps)
        if steps < 1 or steps > 2000:
            raise ValueError('Circle steps must be between 1 and 2000.')
        angle = math.radians(self._angle)
        cx = self._x - math.sin(angle)*radius
        cy = self._y + math.cos(angle)*radius
        vx, vy = self._x-cx,self._y-cy
        sweep = extent * (1 if radius >= 0 else -1)
        for i in range(1,steps+1):
            a = math.radians(sweep*i/steps)
            self.goto(cx+vx*math.cos(a)-vy*math.sin(a),cy+vx*math.sin(a)+vy*math.cos(a))
        self.left(sweep)
    def begin_fill(self):
        self._path = [[self._x,self._y]]
    def end_fill(self):
        if self._path is not None and len(self._path) >= 2:
            _emit({'kind':'fill','points':self._path,'color':self._fill,'width':self._width})
            _emit({'kind':'line','points':self._path + [self._path[0]],'color':self._pen,'width':self._width})
        self._path = None
    def filling(self):
        return self._path is not None
    def dot(self, size=None, *color):
        size = max(self._width+4,self._width*2) if size is None else _number(size)
        _emit({'kind':'dot','x':self._x,'y':self._y,'size':size,'color':_color(color) if color else self._pen})
    def write(self, arg, move=False, align='left', font=('sans-serif',12,'normal')):
        if move:
            raise NotImplementedError('write(move=True) is not supported.')
        _emit({'kind':'text','x':self._x,'y':self._y,'size':font[1],'text':str(arg),'align':align,'color':self._pen})
    def distance(self, x, y=None):
        if y is None:
            x,y = x.position() if isinstance(x,Turtle) else x
        return math.hypot(x-self._x,y-self._y)
    def towards(self, x, y=None):
        if y is None:
            x,y = x.position() if isinstance(x,Turtle) else x
        return math.degrees(math.atan2(y-self._y,x-self._x)) % 360
    def speed(self, value=None):
        return 0
    def hideturtle(self):
        pass
    ht = hideturtle
    def showturtle(self):
        pass
    st = showturtle
    def getscreen(self):
        return Screen()

class Screen:
    def setup(self, *args, **kwargs):
        pass
    def title(self, *args):
        pass
    def tracer(self, *args):
        pass
    def update(self):
        pass
    def mainloop(self):
        pass
    def exitonclick(self):
        pass
    def colormode(self, mode=None):
        return colormode(mode)

_default = Turtle()
goto = _default.goto
setpos = _default.setpos
setposition = _default.setposition
forward = _default.forward
fd = _default.fd
backward = _default.backward
back = _default.back
bk = _default.bk
left = _default.left
lt = _default.lt
right = _default.right
rt = _default.rt
setheading = _default.setheading
seth = _default.seth
heading = _default.heading
position = _default.position
pos = _default.pos
xcor = _default.xcor
ycor = _default.ycor
setx = _default.setx
sety = _default.sety
home = _default.home
penup = _default.penup
pu = _default.pu
up = _default.up
pendown = _default.pendown
pd = _default.pd
down = _default.down
isdown = _default.isdown
pencolor = _default.pencolor
fillcolor = _default.fillcolor
color = _default.color
pensize = _default.pensize
width = _default.width
circle = _default.circle
begin_fill = _default.begin_fill
end_fill = _default.end_fill
filling = _default.filling
dot = _default.dot
write = _default.write
distance = _default.distance
towards = _default.towards
speed = _default.speed
hideturtle = _default.hideturtle
ht = _default.ht
showturtle = _default.showturtle
st = _default.st
getscreen = _default.getscreen
_screen = Screen()
setup = _screen.setup
title = _screen.title
tracer = _screen.tracer
update = _screen.update
mainloop = _screen.mainloop
exitonclick = _screen.exitonclick
done = mainloop
Pen = Turtle

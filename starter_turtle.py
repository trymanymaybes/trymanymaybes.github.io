"""Fixed Many Maybes starter proposal. No random placements.

Run: python -m pip install svg-turtle==1.2.0 cairosvg==2.9.1
     python starter_turtle.py

Uses Python Turtle commands via an SVG-backed turtle for headless export.
Participants need only the resulting image; programming is optional.
All coordinates are fixed. Scale the entire image uniformly; do not move marks.
"""
from pathlib import Path
from svg_turtle import SvgTurtle
import cairosvg

WIDTH, HEIGHT = 800, 600

def draw_starter(t):
    t.speed(0)
    t.pencolor('#233f36')
    t.pensize(3)
    t.penup()
    t.goto(-115, 60-54)
    t.setheading(0)
    t.pendown()
    t.circle(54, steps=180)
    t.penup()
    t.goto(110, -75-29)
    t.setheading(0)
    t.pendown()
    t.circle(29, steps=120)
    # An open arc: enough structure to provoke interpretation, no finished subject.
    t.penup()
    t.goto(-60, -90)
    t.setheading(0)
    t.pendown()
    t.circle(115, extent=78, steps=70)
    # One detached oblique stroke, preserving negative space.
    t.penup()
    t.goto(90, 85)
    t.setheading(35)
    t.pendown()
    t.forward(58)
    t.penup()
    t.hideturtle()

if __name__ == '__main__':
    destination = Path(__file__).resolve().parent
    t = SvgTurtle(WIDTH, HEIGHT)
    draw_starter(t)
    svg_path = destination / 'challenge-01-turtle-starter.svg'
    t.save_as(str(svg_path))
    cairosvg.svg2png(url=str(svg_path), write_to=str(destination / 'challenge-01-turtle-starter.png'), output_width=1200, output_height=900, background_color='white')
    print('Generated fixed SVG and PNG starter proposal.')

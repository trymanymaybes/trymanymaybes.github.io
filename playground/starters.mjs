// Independent playground examples: no dependency on production generation scripts.
const header = '# Editable challenge marks (page headings and footers omitted).\n# Coordinates: (0, 0) is the canvas centre; positive Y points up.\nimport turtle as t\n\nt.pencolor("#234b43")\nt.pensize(3)\n';
const circles = '\ndef circle_at(x, y, radius, steps=80):\n    t.penup()\n    t.goto(x, y - radius)\n    t.setheading(0)\n    t.pendown()\n    t.circle(radius, steps=steps)\n';
const end = '\n# Add your own idea below.\nt.penup()\nt.goto(0, 0)\nt.setheading(0)\nt.pendown()\n';
export const starterCode = Object.freeze({
 '01':header+circles+'\nt.pencolor("#233f36")\ncircle_at(-114.5, 59.5, 54, 180)\ncircle_at(110.5, -75.5, 29, 120)\n\n# Open arc\nt.penup()\nt.goto(-59.5, -90.5)\nt.setheading(0)\nt.pendown()\nt.circle(115, extent=78, steps=70)\n\n# Detached stroke\nt.penup()\nt.goto(90.5, 84.5)\nt.setheading(35)\nt.pendown()\nt.forward(58)\n'+end,
 '02':"# Keep both shapes and leave the central gap completely blank.\nimport turtle as t\n\nt.color(\"#234b43\")\nt.pensize(1)\n\nt.penup()\nt.goto(-275, 220)\nt.pendown()\nt.begin_fill()\nt.goto(-10, 220)\nt.goto(-22, 120)\nt.goto(-48, 35)\nt.goto(-70, -50)\nt.goto(-115, -170)\nt.goto(-275, -170)\nt.goto(-275, 220)\nt.goto(-275, 220)\nt.end_fill()\n\nt.penup()\nt.goto(10, 220)\nt.pendown()\nt.begin_fill()\nt.goto(275, 220)\nt.goto(275, -170)\nt.goto(130, -170)\nt.goto(80, -50)\nt.goto(53, 35)\nt.goto(30, 120)\nt.goto(10, 220)\nt.goto(10, 220)\nt.end_fill()\n\n# Add clues on the shapes or outside the gap.\nt.penup()\nt.goto(0, -240)\nt.pendown()\n",
 '03':header+circles+'\n# One large circle and three smaller ones\ncircle_at(0, 0, 150)\ncircle_at(-55, 50, 25)\ncircle_at(60, 25, 18)\ncircle_at(0, -65, 32)\n'+end,
 '04':header+circles+'\ncircle_at(60, -60, 65)\n\n# Five detached strokes\nfor start, finish in [\n    ((-165, 155), (-151, 148)),\n    ((-132, 134), (-119, 122)),\n    ((-102, 105), (-91, 90)),\n    ((-74, 70), (-64, 54)),\n    ((-50, 32), (-41, 15))\n]:\n    t.penup()\n    t.goto(start)\n    t.pendown()\n    t.goto(finish)\n'+end,
 '05':header+'\ndef square_at(x, y, side):\n    t.penup()\n    t.goto(x, y)\n    t.setheading(0)\n    t.pendown()\n    for _ in range(4):\n        t.forward(side)\n        t.right(90)\n\nsquare_at(-250, 100, 160)\nsquare_at(90, 100, 160)\n'+end,
 blank:'# A blank canvas. Make anything you like.\nimport turtle as t\n\nt.pencolor("#233f36")\nt.pensize(3)\n\n# Try: t.forward(100)\n'
});
export const examples=Object.freeze({
 square:'\n# A square: four equal sides and four right turns\nimport turtle as t\nt.penup()\nt.goto(-50, 50)\nt.setheading(0)\nt.pendown()\nt.pencolor("#b65878")\nfor side in range(4):\n    t.forward(100)\n    t.right(90)\n',
 flower:'\n# A flower: repeat a circle, turning a little each time\nimport turtle as t\nt.penup()\nt.goto(0, 0)\nt.setheading(0)\nt.pendown()\nt.pencolor("#b65878")\nfor petal in range(12):\n    t.circle(40)\n    t.left(30)\n',
 label:'\n# Put a label anywhere on your drawing\nimport turtle as t\nt.penup()\nt.goto(0, -120)\nt.pencolor("#233f36")\nt.write("My many maybe", align="center", font=("sans-serif", 20, "normal"))\n'
});

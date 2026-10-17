# Browser playground — steps 1 and 2

Standalone `/playground/` endpoint in the static website. Main-site navigation, challenge assets, generation scripts and submission integrations remain unchanged. Authentication is unnecessary for local creation. **Draft: browser integration/security QA remains a release gate.**

## Delivered

- Published starters 01, 03, 04, 05 and a blank canvas.
- Mouse/touch/stylus freehand drawing, colour/width, eraser, undo/redo.
- Python turtle editor with Run, Stop, local `.py` open/save, and bounded console output.
- Three layers: starter, last successful turtle result, freehand drawing. Rerunning replaces only the turtle layer; erasing affects only freehand. Failed/stopped runs preserve the prior result. Painting can obscure original marks: visitors are reminded to keep them visible for challenge entries.
- PNG export; JSON project v2 retains editor text, last successful turtle output and freehand data. V1 freehand projects still load. Opening scripts/projects never executes them automatically.
- No accounts, uploads or autosave. Save explicitly; mobile browsers may omit exit warnings.

## Python compatibility

Vendored Skulpt 1.2.0 runs Python 3-style code in the browser; it is not CPython. No installation or runtime CDN dependency. Supports loops, functions, lists/classes, `import turtle`, `from turtle import *`, `Turtle()` instances, math and random. A minimal internal sys module supplies stdout/stderr only: interpreter controls, module access and host APIs are not exposed there.

Supported turtle API is listed in the page and `turtle.py`. Coordinates start at the canvas centre, positive Y upward. Output appears after completion, rather than animating every stroke. `speed`, cursor visibility, `setup`, `title`, `tracer`, `update`, `mainloop`, `exitonclick`, `done` are no-ops for compatibility. Screen dimensions are controlled by the selected starter. Font family/style are ignored. Tk, event callbacks, arbitrary packages, filesystem/network access, `input()`, background changes, clear/reset/stamp/undo and other unlisted turtle features are unsupported. Fill borders use the pen state at `end_fill`.

The existing Challenge 01 `draw_starter(t)` function runs unchanged when passed this Turtle, verified in tests. Full production exporter scripts with svg_turtle, pathlib, CairoSVG or image export dependencies do not run here. The challenge starter already appears underneath user code; visitors do not need to redraw it.

## Execution boundary

- Host page has external local scripts only; no eval or inline scripts. Its only fetches load bundled runtime assets with credentials omitted. It cannot execute Python itself.
- Each Run creates a fresh `sandbox="allow-scripts"` iframe, **without allow-same-origin**, then a blob worker owned by that opaque origin. An ordinary URL path would not isolate code; the iframe sandbox does.
- The isolated bootstrap is CSP hash-pinned, starts only when `self.origin === 'null'` and embedded, and accepts one handshake from its parent. Opening sandbox.html directly does not enable execution.
- Code and trusted runtime sources travel as structured data via a private MessageChannel. User source is never interpolated into HTML or JavaScript.
- Sandbox/worker CSP denies network, images, objects, child frames, forms and base changes. Blob workers inherit the creator CSP. Dynamic evaluation is allowed **only inside the isolated interpreter context**, because Skulpt compiles Python to JavaScript.
- Interpreter read allowlist: our turtle module, math, random, and a minimal sys output shim. Host filesystem/browser bridges are not provided.
- Only validated line/fill/dot/text data reaches the host renderer. No HTML, SVG, URLs, script or arbitrary canvas operations. Loaded projects use the same validation. Imported extras are discarded.
- Run limits: 65,536 code characters (uploaded scripts also limited to 64 KiB); 12,000 commands; 50,000 drawing points; bounded coordinates/widths/text; 4,000 console characters. Skulpt time limit: 4 seconds. Independent iframe worker termination: 6 seconds. Host teardown: 8 seconds after initialization; Stop removes the execution frame.
- Runtime assets are fetched only on first Run and reused in memory. Stop during initial loading prevents execution, though the static asset request can finish in the background.
- Project imports: 8 MiB file limit, 2,000 freehand strokes, 50,000 freehand points, strict schema and allowlisted challenge identifiers. No secrets, login integrations, storage, analytics or repository-writing APIs are bundled.

**Limit:** browser workers do not offer a portable hard memory quota. Pathological allocations may still exhaust a browser process before a time limit fires. Limits reduce resource abuse but are not a guarantee against local denial of service. No server executes the script, and no other visitor shares this runtime. Do not automatically execute imported/shared code.

## Verification performed

`node --test playground/tests/*.test.mjs` — 22 tests covering:
- Geometry, positive/negative circles, multiple turtles, functions, fills, RGB, text, seeded random, and the unchanged Challenge 01 drawing function.
- Rejected filesystem/browser imports and missing desktop APIs; infinite-loop timeout; bounded output; fresh state per execution.
- Project v1/v2 validation, active-content rejection, output limits, prototype/path identifiers, bootstrap CSP hash, standalone refusal, parent handshake and termination logic.

JS syntax and local asset references checked. Unit tests use Node VM to execute the same interpreter; sandbox bootstrap tests use mocks. **They do not verify browser enforcement of CSP, opaque-origin workers, memory isolation or real iframe teardown.**

## Release gate / next step

Browser tooling was unavailable in this environment. Keep the PR draft until actual-browser testing passes:

1. Chrome, Edge, Firefox, Safari; Android Chrome and iOS Safari: runtime load, script Run/Stop, loop timeout, errors, local files, export, save/reopen and responsive/touch controls.
2. Confirm iframe and worker origins are opaque; access to parent DOM, cookies, localStorage and IndexedDB is denied. Confirm actual network attempts (`fetch`, XHR, WebSocket, importScripts) are blocked by inherited CSP and no request reaches an endpoint. Use controlled test fixtures, not published bypass controls.
3. Confirm the bootstrap does nothing when navigated directly or embedded without sandbox; wrong-window/port and stale results are ignored; Stop and all timeout paths terminate the worker; parent page stays responsive.
4. Confirm code/handwritten layers persist across reruns, eraser does not erase the starter, and PNG/project round trips reproduce the image.
5. Only then merge/deploy the standalone endpoint. Main-site links and generator integration remain a separate later step.

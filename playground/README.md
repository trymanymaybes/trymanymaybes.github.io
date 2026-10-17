# Browser playground

Standalone `/playground/` endpoint in the static website. Challenge pages link directly to the matching starter through an allowlisted challenge query parameter. Raw starter geometry and submission integrations remain unchanged. Authentication is unnecessary for local creation. Browser functional and security checks run in GitHub Actions before release.

## Delivered

- Published starters 01, 03, 04, 05 and a blank canvas.
- Canvas toolbar with mouse/touch/stylus freehand drawing, colour/width, eraser, undo/redo and a drawing on/off toggle for touch scrolling.
- Code editor above the canvas, Image / Editable code starter modes, command help and insertable square, flower and label examples. Switching modes replaces the script and turtle result after confirmation when work is present; freehand marks stay. Starter scripts reproduce the challenge marks; page titles and footers are omitted.
- Python turtle editor with Run, Stop, local `.py` open/save, and bounded console output.
- Three layers: starter, last successful turtle result, freehand drawing. Rerunning replaces only the turtle layer; erasing affects only freehand. Failed/stopped runs preserve the prior result. Painting can obscure original marks: visitors are reminded to keep them visible for challenge entries.
- PNG export; JSON project v3 retains editor text, last successful turtle output, freehand data and reference-image visibility. V1 and V2 projects still load. Opening scripts/projects never executes them automatically.
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

`node --test playground/tests/*.test.mjs` — 29 tests covering:
- Geometry, positive/negative circles, multiple turtles, functions, fills, RGB, text, seeded random, and the unchanged Challenge 01 drawing function.
- Editable starter geometry compared against every published challenge, plus all help examples.
- Rejected filesystem/browser imports and missing desktop APIs; infinite-loop timeout; bounded output; fresh state per execution.
- Project v1/v2/v3 validation, active-content rejection, output limits, prototype/path identifiers, bootstrap CSP hash, standalone refusal, parent handshake and termination logic.

JS syntax and local asset references checked. Unit tests use Node VM to execute the same interpreter; sandbox bootstrap tests use mocks. Those unit tests alone do not verify browser isolation; the additional Playwright workflow below tests browser enforcement and teardown.

## Browser release checks

The `Playground browser and security checks` workflow runs the 29 Node tests plus 40 real-browser scenarios in Chromium, Firefox, WebKit, Android-sized Chromium and iPhone-sized WebKit. Run locally from `playground/browser-tests` using `npm ci`, `npx playwright install --with-deps`, and `npm test`. These dependencies are for maintainers only; visitors install nothing.

Browser checks cover:
- Actual opaque iframe/worker origins, parent DOM/cookie/localStorage denial, IndexedDB denial, and blocked fetch/XHR/WebSocket/importScripts. A local test server counts attempted requests and WebSocket upgrades so error callbacks alone cannot falsely pass the network test.
- Independent watchdog termination of a non-yielding worker, Stop teardown, and recovery with a new run.
- Canvas toolbar toggle, starter code, reference visibility persistence, help examples, and code-before-canvas layout.
- Script import without execution, turtle/freehand layer persistence, PNG signature, project round trip, rejected files/imports, touch input and narrow layout overflow.
- Saved desktop/mobile screenshots for review in workflow artifacts.

These are browser-engine tests with emulated device layouts, not physical Android/iPhone tests or branded Chrome/Edge/Safari certification. They do not prove a hard memory quota or absence of all browser/interpreter vulnerabilities. In-app browsers may differ. The workflow's latest green run and checked commit identify release evidence.

Challenge links and QR distribution assets are integrated; browser drawing remains independent of production media generation. The playground is public and requires no login; future hosted gallery submissions and admin access remain separate.

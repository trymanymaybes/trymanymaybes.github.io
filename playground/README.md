# Browser playground — step 1

Standalone `/playground/` endpoint for the existing static website. No navigation links are added to the main site yet. No generation scripts or submission integrations are used or changed.

## Delivered

- Published starters 01, 03, 04, 05, referenced from existing website assets; blank canvas.
- Mouse/touch/stylus freehand drawing, colour/width controls, eraser, undo/redo.
- PNG export and versioned JSON project save/open.
- Starter and freehand content on separate layers. Erasing cannot remove the starter. Painting can obscure it: challenge instructions tell visitors to keep original marks visible.
- Unsaved-work confirmation on replacement and best-effort browser exit warning. No autosave; mobile browsers may omit exit warnings. Save projects explicitly.

## Security boundary

This version **does not execute uploaded code**. Only a validated JSON schema is accepted. Challenge IDs resolve through an own-property allowlist; files cannot supply URLs, markup, code or asset paths. Uploaded fields are copied into a fresh schema. Limits: 4 MiB input, 2,000 strokes, 50,000 points, finite bounded coordinates and brush widths, hex colours only. No remote uploads, credentials, analytics, storage or repository write APIs. CSP disables connections, workers, frames, objects and form submission; scripts/styles are local external assets.

The path is separate, but it shares the main site's origin. **Do not add arbitrary code execution to this page's origin.** Before the turtle milestone, implement an isolated execution origin/sandbox, restrictive runtime CSP, narrowly validated drawing messages, termination and output limits. A worker alone is not a security sandbox. Keep main-site cookies/storage and deployment credentials inaccessible to user code. Host a pinned Python runtime locally if used; preserve its licence. Supporting turtle does not mean supporting desktop Tk or arbitrary package installation.

## Verification

Run `node --test playground/tests/project.test.mjs` and `node --check playground/app.js`.
Browser QA is still required: Chrome/Edge/Firefox/Safari, Android Chrome, iOS Safari; touch drawing, pointer cancellation, starter sizing, eraser preservation, undo/redo, PNG export, save/open, malformed files, unsaved changes and narrow layouts. In-app browsers require separate validation. Browser automation was unavailable in the implementation environment; no claim of cross-browser validation is made.

## Next milestones

2. Browser Python turtle runner, compatibility reference, isolated execution and adversarial security tests; preserve freehand layer on rerun.
3. Verify browser/device matrix, then link from the main website. Shared generator integration remains deferred.

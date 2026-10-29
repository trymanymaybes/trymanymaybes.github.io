# Many Maybes public website

Public static Challenge 01 pilot, deployed with GitHub Pages from main/root. All tracked files are intended for public access. Challenge code lives at https://github.com/trymanymaybes/many-maybes-challenges ; internal project materials remain in the private project repository.

The gallery contains illustrative examples, not participant submissions. Submission images are prepared locally and emailed separately for manual review; no automatic upload, accounts, analytics or comments service. Individual gallery pages offer sharing links, downloadable images and embed code for blogs/websites. Social media generally uses links or uploaded images.

The challenge, instructions and printable PDF share the same rules: preserve all original marks and their relative positions, allow whole-starter rotation/uniform scaling, and explore an object, a place and something happening. Examples explain thinking moves. Public YouTube videos are embedded on demand in the gallery; unpublished videos are represented by availability notes.

Do not add secrets, identity documents, participant emails, unreviewed submissions or internal research. Keep the strict CSP and submission limits. The gallery allows only youtube-nocookie.com frames for optional video playback. Changes should preserve existing links and challenge QR destination.

## Protected submission integration

The frontend integration is installed but disabled in submission-config.js until provider setup and live security checks are complete. Email remains the active pilot intake. Only public project URLs, publishable key and Turnstile site key belong in that config. Never add server-role keys or OAuth/Turnstile secrets. Backend source and activation checklist live in the private project repository. Enabling the frontend alone does not create an upload service.

## Accessible challenge catalogue

`challenge-catalogue.json` lists all ten challenges with stable IDs, plain-text descriptions, descriptive `alt` text, image paths, page paths, dimensions and reflection questions. Paths are relative to the website root. External narration clients can read descriptions and alt text directly without scraping HTML. This update does not modify external apps.

The same text is exposed on each challenge page and in the playground. `scripts/build_submission_catalogue.py` refreshes submission options. `scripts/build_new_starters.py` reproducibly generates Challenges 07–10 SVG geometry and standalone Python starters; the matching scripts are bundled in `playground/starters.mjs`. Keep catalogue, page and playground metadata synchronized; browser checks verify them. Challenges 07–10 currently provide website instructions, SVG starters and playground support; example galleries, PDFs and social videos are separate deliverables.


## Challenge video catalogue

`video-catalogue.json` contains verified public YouTube IDs, format, duration, role, Instagram reel links and availability notes. `gallery-videos.mjs` combines it with the challenge catalogue, so future challenges receive an empty video section automatically and published entries become watchable without changing the renderer. Only `visibility: public` YouTube entries are eligible; IDs and Instagram URLs are allowlisted and duplicate IDs are filtered. Private/draft IDs and the detailed owner audit stay in the private production repository.

Update the catalogues, then run `python scripts/build_video_sections.py` to refresh static no-JavaScript links and each challenge page. Run `node --test tests/video-model.test.mjs`. No platform publication or deletion occurs in this process. Verify visibility before adding a public ID.

Players load on explicit click with autoplay disabled; only one player is loaded at a time. The frame uses an origin-only cross-site referrer for YouTube client identification. Its CSP exception is limited to `https://www.youtube-nocookie.com`; no remote scripts or thumbnail hosts are added. The static links survive fetch or JavaScript failures.

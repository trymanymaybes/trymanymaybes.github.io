# Publishing illustrative possibilities

The gallery fetches `challenge-catalogue.json` and `possibilities-catalogue.json` on each visit. No gallery JavaScript or HTML edits are required when adding catalogue entries.

1. Publish the challenge starter and page, and add its metadata to `challenge-catalogue.json`.
2. Publish each example image and its page (or use `gallery.html#EXAMPLE_ID` for a gallery detail section).
3. Add an entry to the `items` array in `possibilities-catalogue.json`:

```json
{
  "id": "challenge-11-example-name",
  "challengeId": "11",
  "title": "Example title",
  "image": "challenge-11-example-name.png",
  "alt": "Describe the visible illustration and its meaningful details.",
  "explanation": "Explain how the added clues change the interpretation.",
  "page": "gallery.html#challenge-11-example-name",
  "published": true
}
```

Use a unique ID, an exact matching challenge ID, and relative local asset/page paths. Unpublished, incomplete, unmatched or unsafe entries are excluded. A challenge without examples is excluded from random selection but can still be found by number, with a link to try it. Random selection chooses a challenge first and then one of its examples. “Surprise me” changes the challenge when another eligible challenge exists.

The full gallery list is generated from these same catalogues. Original HTML remains as a fallback if loading fails or JavaScript is unavailable. Existing gallery anchors still open the correct nested section. Community submissions keep their separate reviewed feed; this catalogue does not publish unreviewed submissions.

"""Build submission options from published pages and their accessible metadata."""
from pathlib import Path
import json, re
root = Path(__file__).resolve().parents[1]
metadata = {c['id']: c for c in json.loads((root / 'challenge-catalogue.json').read_text())['items']}
items = []
for page in sorted(root.glob('challenge-*.html')):
    match = re.fullmatch(r'challenge-([0-9]+)\.html', page.name)
    if match:
        key = match.group(1)
        c = metadata.get(key)
        items.append({'id': key, 'title': f'Challenge {key}' + (f": {c['title']}" if c else '')})
items.append({'id': 'blank', 'title': 'Free creation'})
(root / 'submission-challenges.json').write_text(json.dumps({'items': items}, ensure_ascii=False, indent=2) + '\n')

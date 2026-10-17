"""Build submission metadata from published challenge pages; no database edits."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
items=[]
for page in sorted(root.glob('challenge-*.html')):
    match=re.fullmatch(r'challenge-([0-9]+)\.html',page.name)
    if match:
        key=match.group(1)
        items.append({'id':key,'title':f'Challenge {key}'})
items.append({'id':'blank','title':'Free creation'})
(root/'submission-challenges.json').write_text(json.dumps({'items':items},indent=2)+'\n')

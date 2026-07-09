import json
from pathlib import Path
import sys

p = Path(__file__).resolve().parents[1] / 'sample.json'
try:
    with p.open('r', encoding='utf-8') as f:
        json.load(f)
    print(f"OK: {p} is valid JSON")
    sys.exit(0)
except Exception as e:
    import traceback
    print(f"ERROR: Failed to parse {p}:", file=sys.stderr)
    traceback.print_exc()
    sys.exit(2)

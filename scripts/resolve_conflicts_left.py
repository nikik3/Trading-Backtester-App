import re
from pathlib import Path

p = Path(__file__).resolve().parents[1] / 'sample.json'
text = p.read_text(encoding='utf-8')

# Normalize CRLF
text = text.replace('\r\n', '\n')

# Pattern to match git conflict blocks
pattern = re.compile(r"(?s)<<<<<<<[^\n]*\n(.*?)\n=======(.*?)\n>>>>>>>[^\n]*\n")

count = 0
while True:
    m = pattern.search(text)
    if not m:
        break
    left = m.group(1)
    # Keep left side exactly as-is
    text = text[:m.start()] + left + text[m.end():]
    count += 1

# Write back with CRLF line endings
p.write_text(text.replace('\n', '\r\n'), encoding='utf-8')
print(f"Kept left-side for {count} conflict blocks in {p}")

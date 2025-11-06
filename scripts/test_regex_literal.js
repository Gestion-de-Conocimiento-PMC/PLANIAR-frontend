const s = 'GINIATOULLINE\\, ANDREI (Principal) \\n';
const re = /([^\\,]+)\\,\s*([^()\\n\\r]+)(?:\s*\([^)]*\))?/gi;
let m;
while ((m = re.exec(s)) !== null) {
  console.log('match groups:', m[1], '||', m[2], 'full->', m[0]);
}

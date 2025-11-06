const fs = require('fs');
const path = require('path');
const file = 'c:\\Users\\juand\\Downloads\\SEGUNDO SEMESTRE 2025.ics';
const txt = fs.readFileSync(file, 'utf8');

function parseInstructorsFromDescription(desc) {
  const descStr = String(desc || '');
  const instLineMatch = descStr.match(/Instructor:\s*([^\n\r]+)/i);
  if (instLineMatch && instLineMatch[1]) {
    const instRaw = instLineMatch[1].trim();
    // Simpler pairwise parser: split on escaped commas and pair surname parts with following token(s)
    const splitParts = instRaw.split(/\\,\s*/);
    const partsOut = [];
    let i = 0;
    while (i < splitParts.length - 1) {
      const rawLast = splitParts[i].replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\/g, '').trim();
      let next = splitParts[i + 1];
      next = next.replace(/\\n/g, ' ').replace(/\\r/g, ' ').trim();

      let firstCandidate = '';
      let leftover = '';
      const parenIdx = next.indexOf(')');
      if (parenIdx !== -1) {
        const before = next.slice(0, parenIdx + 1).trim();
        firstCandidate = before;
        leftover = next.slice(parenIdx + 1).trim();
      } else {
        const toks = next.split(/\s+/);
        firstCandidate = toks[0] || '';
        leftover = toks.slice(1).join(' ');
      }

      if (leftover) {
        splitParts[i + 1] = leftover;
      } else {
        i = i + 1;
      }

      const lastClean = rawLast.replace(/,+$/g, '').trim();
      let firstClean = firstCandidate.replace(/\([^)]*\)/g, '').trim();
      const principal = /\(\s*Principal\s*\)/i.test(firstCandidate);
      const lastParts = lastClean.split(/\s+/).filter(Boolean);
      const surnameDisplay = (principal && lastParts.length > 1) ? lastParts.slice().reverse().join(' ') : lastClean;
      if (firstClean) partsOut.push(`${firstClean} ${surnameDisplay}`.trim());

      i = i + 1;
    }
    const parts = partsOut;
    if (parts.length > 0) return parts.join(', ');
    return instRaw.replace(/\\/g,'');
  }
  return '';
}

// Find all 'Instructor:' occurrences and parse each
const instLines = [...txt.matchAll(/Instructor:\s*([^\r\n]+)/gi)]
if (instLines.length > 0) {
  instLines.forEach((it, idx) => {
    const rawSeg = it[1].trim()
    console.log('\nInstructor #' + (idx+1) + ' raw:', rawSeg)
    console.log('Parsed:', parseInstructorsFromDescription('Instructor: ' + rawSeg))
  })
} else {
  console.log('No Instructor line found in file')
}

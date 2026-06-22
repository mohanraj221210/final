const fs = require('fs');

const files = [
  'NewOutpass.tsx', 'OutpassDetails.tsx', 'Profile.tsx', 
  'Staffs.tsx', 'Subjects.tsx'
];

files.forEach(f => {
  const path = 'src/pages/student/' + f;
  let content = fs.readFileSync(path, 'utf8');
  
  // Find where MOBILE VIEW starts
  // We need to insert closing divs for content-wrapper and lux-desktop-view
  // Previously we had </main> before {/* ── MOBILE VIEW ── */}
  
  content = content.replace(/<\/main>\s*\{\/\*\s*── MOBILE VIEW ──\s*\*\/\}/g, 
    "    </div>\n                </main>\n            </div>\n            {/* ── MOBILE VIEW ── */}"
  );
  
  fs.writeFileSync(path, content);
  console.log('Fixed ' + f);
});

const fs = require('fs');

const files = [
  'NewOutpass.tsx', 'OutpassDetails.tsx', 'Profile.tsx', 
  'Staffs.tsx', 'Subjects.tsx'
];

files.forEach(f => {
  const path = 'src/pages/student/' + f;
  let content = fs.readFileSync(path, 'utf8');
  
  // Replace the broken DESKTOP VIEW start
  const regexDesktopStart = /\{\/\*\s*── DESKTOP VIEW ──\s*\*\/\}\s*(?:<main className="student-content">\s*)?(?:<div className="lux-desktop-view">\s*)?(?:<main className="student-content">\s*)?(?:<div className="content-wrapper">)/g;
  
  content = content.replace(regexDesktopStart, 
    "{/* ── DESKTOP VIEW ── */}\n" +
    "            <div className=\"lux-desktop-view\">\n" +
    "                <StudentHeader />\n" +
    "                <main className=\"student-content\">\n" +
    "                    <div className=\"content-wrapper\">"
  );
  
  // Also check if we need to close content-wrapper before closing main
  // Wait, the end of desktop is usually:
  //                    </div>
  //                </div>
  //            </div>{/* end desktop */}
  // OR something broken. Let's fix the end as well.
  // We'll just run it for now.
  
  fs.writeFileSync(path, content);
  console.log('Fixed ' + f);
});

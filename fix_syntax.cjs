const fs = require('fs');

const files = [
  'NewOutpass.tsx', 'OutpassDetails.tsx', 'Profile.tsx', 
  'Staffs.tsx', 'StudentViewStaffProfile.tsx', 
  'SubjectDetails.tsx', 'Subjects.tsx'
];

files.forEach(f => {
  const path = 'src/pages/student/' + f;
  let content = fs.readFileSync(path, 'utf8');
  
  // Replace opening main
  // Wait, if there are multiple StudentHeaders? E.g. in empty states.
  // We'll just replace the main tag completely and re-insert it properly.
  content = content.replace(/<main className=\"student-content\">\r?\n/g, '');
  content = content.replace(/<\/main>\r?\n/g, '');
  
  // Now add them back correctly.
  // In lux-desktop-view, after StudentHeader
  content = content.replace(/(<div className="lux-desktop-view">\s*<StudentHeader \/>\s*)/g, '<main className="student-content">\n');
  
  // Before </div>{/* end desktop */}
  content = content.replace(/(\s*<\/div>\s*\{\/\*\s*end desktop\s*\*\/\})/g, '\n</main>');
  
  // Also fix the empty state StudentHeader issue (like in SubjectDetails/StaffProfile)
  // Where it's just:
  // <StudentHeader />
  // <div className="content-wrapper">
  content = content.replace(/(<div className=\"student-page[^\"]*\">\s*<StudentHeader \/>\s*)(<div className=\"content-wrapper\">)/g, '<main className="student-content">\n');
  // And close it before the last div of that return
  // This might be tricky, let's just do a manual replace for the empty states
  
  fs.writeFileSync(path, content);
  console.log('Fixed ' + f);
});

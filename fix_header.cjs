const fs = require('fs');

const files = [
  'NewOutpass.tsx', 'OutpassDetails.tsx', 'Profile.tsx', 
  'Staffs.tsx', 'Subjects.tsx', 'BusRoutes.tsx'
];

files.forEach(f => {
  const path = 'src/pages/student/' + f;
  let content = fs.readFileSync(path, 'utf8');
  
  // Add <StudentHeader /> back if it's missing in lux-desktop-view
  if (!content.includes('<StudentHeader />')) {
      content = content.replace(/<div className="lux-desktop-view">/, '<div className="lux-desktop-view">\n                <StudentHeader />');
  }

  // Also fix the activeTab="" error in StudentBottomNav
  content = content.replace(/<StudentBottomNav activeTab=\"\" \/>/g, '<StudentBottomNav activeTab="home" />');
  
  fs.writeFileSync(path, content);
  console.log('Fixed ' + f);
});

// Fix activeTab in StudentViewStaffProfile and SubjectDetails too
['StudentViewStaffProfile.tsx', 'SubjectDetails.tsx'].forEach(f => {
  const path = 'src/pages/student/' + f;
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/<StudentBottomNav activeTab=\"\" \/>/g, '<StudentBottomNav activeTab="home" />');
  fs.writeFileSync(path, content);
});


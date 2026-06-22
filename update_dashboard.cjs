const fs = require('fs');

const path = 'src/pages/student/Dashboard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Import LoadingSpinner
if (!content.includes('import LoadingSpinner')) {
    content = content.replace(
        "import StudentBottomNav from '../../components/StudentBottomNav';", 
        "import StudentBottomNav from '../../components/StudentBottomNav';\nimport LoadingSpinner from '../../components/LoadingSpinner';"
    );
}

// 2. Replace loading screen div
content = content.replace(
    /if \(Loading\) return <div className="loading-screen">Loading\.\.\.<\/div>;/g,
    "if (Loading) return <LoadingSpinner />;"
);

fs.writeFileSync(path, content);
console.log('Updated Dashboard.tsx');

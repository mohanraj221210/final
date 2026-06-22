const fs = require('fs');

const replaceInFile = (path, replaceFn) => {
    let content = fs.readFileSync(path, 'utf8');
    
    if (!content.includes('import LoadingSpinner')) {
        content = content.replace(
            /(import StudentHeader from '..\/..\/components\/StudentHeader';)/,
            "\nimport LoadingSpinner from '../../components/LoadingSpinner';"
        );
    }
    
    content = replaceFn(content);
    fs.writeFileSync(path, content);
    console.log('Updated ' + path);
};

// BusRoutes.tsx
replaceInFile('src/pages/student/BusRoutes.tsx', (content) => {
    return content.replace(
        /\{\s*loading \? \(\s*<div className="lux-glass-card loading-card">\s*<p>Loading bus routes\.\.\.<\/p>\s*<\/div>\s*\) : /g,
        "{loading ? (<LoadingSpinner />) : "
    );
});

// OutpassDetails.tsx
replaceInFile('src/pages/student/OutpassDetails.tsx', (content) => {
    let result = content.replace(
        /\{\s*loading \? \(\s*<div className="lux-glass-card outpass-item loading-skeleton">[\s\S]*?<\/div>\s*\) : /g,
        "{loading ? (<LoadingSpinner />) : "
    );
    // There are two loading blocks in OutpassDetails
    result = result.replace(
        /\{\s*loading \? \(\s*<div className="lux-glass-card loading-skeleton" style=\{\{ height: '120px' \}\}>\s*<\/div>\s*\) : /g,
        "{loading ? (<LoadingSpinner />) : "
    );
    return result;
});

// Staffs.tsx
replaceInFile('src/pages/student/Staffs.tsx', (content) => {
    let result = content.replace(
        /\{\s*loading \? \(\s*<div className="lux-glass-card staffs-header loading-skeleton" style=\{\{ height: '120px', marginBottom: '24px' \}\}>\s*<\/div>\s*\) : /g,
        "{loading ? (<LoadingSpinner />) : "
    );
    result = result.replace(
        /\{\s*loading \? \(\s*Array\.from\(\{ length: 6 \}\)\.map\(\(_, i\) => \(\s*<div key=\{i\} className="lux-glass-card staff-card loading-skeleton" style=\{\{ height: '280px' \}\}>\s*<\/div>\s*\)\)\s*\) : /g,
        "{loading ? (<LoadingSpinner />) : "
    );
    return result;
});

// StudentViewStaffProfile.tsx
replaceInFile('src/pages/student/StudentViewStaffProfile.tsx', (content) => {
    return content.replace(
        /if \(loading\) \{\s*return \(\s*<div className="student-page loading-screen-staff animate-page-enter">[\s\S]*?<\/div>\s*\);\s*\}/g,
        "if (loading) return <LoadingSpinner />;"
    );
});

// Profile.tsx
// Does Profile have loading? Let's check
replaceInFile('src/pages/student/Profile.tsx', (content) => {
    return content.replace(
        /if \(loading\) return <div className="loading-screen">Loading\.\.\.<\/div>;/g,
        "if (loading) return <LoadingSpinner />;"
    );
});

// Subjects.tsx
replaceInFile('src/pages/student/Subjects.tsx', (content) => {
    return content.replace(
        /if \(loading\) return <div className="loading-screen">Loading\.\.\.<\/div>;/g,
        "if (loading) return <LoadingSpinner />;"
    );
});

// SubjectDetails.tsx
replaceInFile('src/pages/student/SubjectDetails.tsx', (content) => {
    return content.replace(
        /if \(loading\) return <div className="loading-screen">Loading\.\.\.<\/div>;/g,
        "if (loading) return <LoadingSpinner />;"
    );
});

// NewOutpass.tsx
replaceInFile('src/pages/student/NewOutpass.tsx', (content) => {
    return content.replace(
        /if \(loading\) return <div className="loading-screen">Loading\.\.\.<\/div>;/g,
        "if (loading) return <LoadingSpinner />;"
    );
});


const fs = require('fs');
const path = require('path');

const files = [
    {
        name: 'c:/code/final1/final/src/pages/admin/YearInchargeDetailsAdmin.tsx',
        regex: /await adminService\.updateIncharge\(incharge\._id, \{ \.\.\.incharge, password \}\);/g,
        replace: 'await adminService.resetInchargePassword(incharge._id, password);'
    },
    {
        name: 'c:/code/final1/final/src/pages/admin/WardenDetailsAdmin.tsx',
        regex: /await adminService\.updateWarden\(warden\._id, \{ \.\.\.warden, password \}\);/g,
        replace: 'await adminService.resetWardenPassword(warden._id, password);'
    },
    {
        name: 'c:/code/final1/final/src/pages/admin/SecurityDetailsAdmin.tsx',
        regex: /await adminService\.updateSecurity\(security\._id, \{ \.\.\.security, password \}\);/g,
        replace: 'await adminService.resetSecurityPassword(security._id, password);'
    },
    {
        name: 'c:/code/final1/final/src/pages/admin/BusDetailsAdmin.tsx',
        regex: /await adminService\.updateBus\(bus\._id, \{ \.\.\.bus, password \}\);/g,
        replace: 'await adminService.resetBusPassword(bus._id, password);'
    }
];

for (const file of files) {
    if (!fs.existsSync(file.name)) continue;
    let content = fs.readFileSync(file.name, 'utf8');
    
    // Some might use `watchman` variable or `security` variable, let's be more robust
    if (file.name.includes('Security')) {
        content = content.replace(/await adminService\.updateWatchman\([^,]+,\s*\{.*?password.*?\}\);/g, 'await adminService.resetSecurityPassword(security._id, password);');
        content = content.replace(/await adminService\.updateSecurity\([^,]+,\s*\{.*?password.*?\}\);/g, 'await adminService.resetSecurityPassword(security._id, password);');
    } else {
        content = content.replace(file.regex, file.replace);
    }

    fs.writeFileSync(file.name, content, 'utf8');
    console.log('Updated ' + file.name);
}

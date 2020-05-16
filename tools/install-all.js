const { execSync } = require('child_process');

console.log('installing for @overseer/common');
execSync('npm install --only=production', { cwd: './src/common' });

console.log('installing for @overseer/client');
execSync('npm install --only=production', { cwd: './src/client' });

console.log('installing for @overseer/server');
execSync('npm install --only=production', { cwd: './src/server' });

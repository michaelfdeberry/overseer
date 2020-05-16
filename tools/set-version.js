/***
 * This is just a wrapper around npm version that updates all packages at once to keep them in sync.
 * It will run version for each child package and commit the changes, the update the parent package.
 */
const { execSync } = require('child_process');
const versionArgs = process.argv.slice(2).join(' ');

if (!versionArgs) {
  console.error('Unable to determine version command');
  process.exit(1);
} else {
  console.log(`running "npm version" with "${versionArgs}" for all packages`);
}

try {
  if (execSync('git diff --name-only').toString().trim().length > 0) {
    throw new Error('Please commit all pending changes before updating versions');
  }

  const results = [
    execSync(`npm version ${versionArgs} --prefix ./src/client`).toString().trim(),
    execSync(`npm version ${versionArgs} --prefix ./src/common`).toString().trim(),
    execSync(`npm version ${versionArgs} --prefix ./src/server`).toString().trim()
  ];

  if (!results.every((v) => v === results[0])) {
    throw Error('Mismatched package versions');
  }

  execSync('git add ./');
  execSync(`git commit -m "Updated child packages version to ${results[0]}"`);

  execSync(`npm version ${versionArgs} -m "Updated parent package version to ${results[0]}"`);
} catch (error) {
  console.log(error);
  process.exit(1);
}

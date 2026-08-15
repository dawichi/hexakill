import { execFileSync } from 'node:child_process';

const expectedNode = '24.19.0';
const expectedNpm = '11.17.0';
const actualNode = process.versions.node;
const actualNpm = execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();

if (actualNode !== expectedNode || actualNpm !== expectedNpm) {
  console.error(
    `Expected Node.js ${expectedNode} and npm ${expectedNpm}; found Node.js ${actualNode} and npm ${actualNpm}.`,
  );
  process.exit(1);
}

console.log(`Verified Node.js ${actualNode} and npm ${actualNpm}.`);

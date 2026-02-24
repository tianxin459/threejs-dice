import { execSync } from 'child_process';
import { unlinkSync, existsSync } from 'fs';

// Remove stale lock files
const lockFiles = ['package-lock.json', 'pnpm-lock.yaml'];
for (const file of lockFiles) {
  if (existsSync(file)) {
    unlinkSync(file);
    console.log(`Removed ${file}`);
  }
}

// Run npm install to generate a fresh package-lock.json
try {
  execSync('npm install --no-audit --no-fund', { stdio: 'inherit', cwd: '/vercel/share/v0-project' });
  console.log('Dependencies installed successfully');
} catch (e) {
  console.error('Install failed:', e.message);
}

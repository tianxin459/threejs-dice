import { execSync } from 'child_process'

try {
  console.log('Generating fresh pnpm-lock.yaml...')
  execSync('pnpm install --no-frozen-lockfile', {
    cwd: '/vercel/share/v0-project',
    stdio: 'inherit',
  })
  console.log('Done!')
} catch (e) {
  console.error('pnpm install failed, trying npm...')
  try {
    execSync('npm install', {
      cwd: '/vercel/share/v0-project',
      stdio: 'inherit',
    })
    console.log('npm install done!')
  } catch (e2) {
    console.error('npm install also failed:', e2.message)
  }
}

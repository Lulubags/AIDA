import { build } from 'esbuild';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function buildProject() {
  console.log('Building frontend with Vite...');
  try {
    await execAsync('vite build');
    console.log('Frontend build completed successfully');
  } catch (error) {
    console.error('Frontend build failed:', error.message);
    process.exit(1);
  }

  console.log('Building backend with esbuild...');
  try {
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outdir: 'dist',
      packages: 'external',
      sourcemap: true,
      minify: process.env.NODE_ENV === 'production',
    });
    console.log('Backend build completed successfully');
  } catch (error) {
    console.error('Backend build failed:', error);
    process.exit(1);
  }
}

buildProject().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
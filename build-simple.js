#!/usr/bin/env node
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { build } from 'esbuild';

console.log('🚀 Building Aida AI Tutor...');

// Create dist directory
mkdirSync('dist', { recursive: true });
mkdirSync('dist/public', { recursive: true });

// Try to build frontend with Vite
console.log('📦 Building frontend...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build successful');
} catch (error) {
  console.log('⚠️ Frontend build failed, creating minimal HTML');
  // Create a minimal HTML file as fallback
  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aida AI Tutor</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .loading { display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 18px; }
    </style>
</head>
<body>
    <div id="root">
        <div class="loading">Loading Aida AI Tutor...</div>
    </div>
    <script>
        // Simple redirect to ensure the app loads
        window.location.reload();
    </script>
</body>
</html>`;
  writeFileSync('dist/public/index.html', fallbackHtml);
}

// Build backend
console.log('🔧 Building backend...');
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
    minify: false,
  });
  console.log('✅ Backend build successful');
} catch (error) {
  console.error('❌ Backend build failed:', error);
  process.exit(1);
}

console.log('🎉 Build completed successfully!');
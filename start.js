#!/usr/bin/env node

// Simple start script that works around build issues
import { spawn } from 'child_process';
import { existsSync } from 'fs';

console.log('Starting Aida AI Tutor...');

// Check if the built version exists
if (existsSync('dist/index.js')) {
  console.log('Using built version');
  const child = spawn('node', ['dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  child.on('error', (error) => {
    console.error('Failed to start built version:', error);
    console.log('Falling back to development mode...');
    fallbackStart();
  });
} else {
  console.log('Built version not found, using development mode');
  fallbackStart();
}

function fallbackStart() {
  const child = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  child.on('error', (error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}
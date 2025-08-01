#!/usr/bin/env node

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const viteProcess = spawn('vite', ['dev'], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
})

const workerProcess = spawn('tsx', ['scripts/import-recipe-worker.ts'], {
  stdio: 'inherit',
  cwd: join(__dirname, '..')
})

const cleanup = (signal) => {
  console.log(`\nReceived ${signal}, shutting down gracefully...`)
  
  // Send SIGTERM to both processes
  viteProcess.kill('SIGTERM')
  workerProcess.kill('SIGTERM')
  
  // Give them time to clean up
  setTimeout(() => {
    console.log('Force killing processes...')
    viteProcess.kill('SIGKILL')
    workerProcess.kill('SIGKILL')
    process.exit(0)
  }, 5000)
}

// Handle shutdown signals
process.on('SIGINT', () => cleanup('SIGINT'))
process.on('SIGTERM', () => cleanup('SIGTERM'))

// Handle process exits
viteProcess.on('exit', (code) => {
  console.log(`Vite process exited with code ${code}`)
  workerProcess.kill('SIGTERM')
})

workerProcess.on('exit', (code) => {
  console.log(`Worker process exited with code ${code}`)
  viteProcess.kill('SIGTERM')
})

console.log('Development server started with graceful shutdown handling...')
console.log('Press Ctrl+C to stop both processes gracefully') 
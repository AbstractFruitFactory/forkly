import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const spawnImportWorker = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const workerPath = join(__dirname, 'import-recipe-worker.ts')
    const worker = spawn('tsx', [workerPath], {
      stdio: 'inherit',
      env: { ...process.env }
    })

    worker.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Worker exited with code ${code}`))
      }
    })

    worker.on('error', (err) => {
      reject(err)
    })

    // Set a timeout to kill the worker if it runs too long
    const timeout = setTimeout(() => {
      worker.kill('SIGTERM')
      reject(new Error('Worker timeout - killed after 5 minutes'))
    }, 5 * 60 * 1000) // 5 minutes

    worker.on('close', () => {
      clearTimeout(timeout)
    })
  })
} 
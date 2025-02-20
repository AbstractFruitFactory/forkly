import { readFileSync, createReadStream } from 'fs'
import { createInterface } from 'readline'

// Synchronous approach
export const readJsonlSync = (filePath: string): unknown[] => {
  return readFileSync(filePath, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line))
}

// Asynchronous approach (better for large files)
export async function readJsonlAsync(filePath: string): Promise<unknown[]> {
  const fileStream = createReadStream(filePath)
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  const data: unknown[] = []

  for await (const line of rl) {
    if (line.trim()) {
      data.push(JSON.parse(line))
    }
  }

  return data
}

// Usage:
try {
  // Sync
  const dataSync = readJsonlSync('./file.jsonl')

  // Async
  readJsonlAsync('./file.jsonl')
    .then(data => console.log(data))
    .catch(err => console.error(err))
} catch (error) {
  console.error('Error reading file:', error)
}
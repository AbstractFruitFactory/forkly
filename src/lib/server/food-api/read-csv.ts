import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'
import csv from 'csv-parser'

interface CSVReadOptions {
  separator?: string
  skipHeader?: boolean
  maxRows?: number
}

type CSVRow = Record<string, string>

// Asynchronous CSV reading with streaming
export async function readCsvAsync<T extends CSVRow>(
  filePath: string,
  options: CSVReadOptions = {}
): Promise<T[]> {
  const {
    separator = '\t',
    skipHeader = false,
    maxRows = Infinity
  } = options

  return new Promise<T[]>((resolve, reject) => {
    const results: T[] = []
    const stream = createReadStream(filePath)
      .pipe(csv({ separator }))
      .on('data', (row: T) => {
        if (results.length < maxRows) {
          results.push(row)
        }
      })
      .on('end', () => {
        resolve(results)
      })
      .on('error', (error: Error) => {
        reject(error)
      })
  })
}

// Read CSV line by line (more memory efficient)
export async function* readCsvLines<T extends CSVRow>(
  filePath: string,
  options: CSVReadOptions = {}
): AsyncGenerator<T> {
  const {
    separator = '\t',
    skipHeader = false,
    maxRows = Infinity
  } = options

  let count = 0
  const fileStream = createReadStream(filePath)
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  for await (const line of rl) {
    if (count >= maxRows) break
    if (skipHeader && count === 0) {
      count++
      continue
    }

    if (line.trim()) {
      const values = line.split(separator)
      const row = values.reduce<Record<string, string>>((obj, val, idx) => {
        obj[`field${idx + 1}`] = val.trim()
        return obj
      }, {}) as T

      yield row
      count++
    }
  }
} 
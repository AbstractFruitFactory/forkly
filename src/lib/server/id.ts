import type { Buffer } from 'node:buffer'
import { randomBytes } from 'node:crypto'

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function base62Encode(buffer: Buffer): string {
  let num = BigInt('0x' + buffer.toString('hex'))
  let encoded = ''
  
  while (num > 0n) {
    encoded = ALPHABET[Number(num % 62n)] + encoded
    num = num / 62n
  }

  return encoded || '0'
}

export function generateId(): string {
  const bytes = randomBytes(8)
  return base62Encode(bytes)
} 
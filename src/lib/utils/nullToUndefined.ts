/**
 * Replaces all null values in an object with undefined
 * Type transformation also converts null to undefined in the return type
 * 
 * @example
 * // Input type: { name: string, description: string | null }
 * const data = { name: "Recipe", description: null };
 * 
 * // Output type: { name: string, description: string | undefined }
 * const transformed = nullToUndefined(data);
 * // transformed = { name: "Recipe", description: undefined }
 * 
 * // Works with nested objects and arrays
 * const complex = {
 *   items: [{ value: null }, { value: 42 }],
 *   metadata: { author: null, created: new Date() }
 * };
 * const result = nullToUndefined(complex);
 * // result = {
 * //   items: [{ value: undefined }, { value: 42 }],
 * //   metadata: { author: undefined, created: [Date] }
 * // }
 */
export type NullToUndefined<T> = T extends null ? undefined :
  T extends Date ? T :
  T extends Array<infer U> ? Array<NullToUndefined<U>> :
  T extends object ? { [K in keyof T]: NullToUndefined<T[K]> } :
  T

/**
 * Transforms all null values in an object to undefined
 * @param obj The object to transform
 * @returns A new object with all null values replaced with undefined
 */
export const nullToUndefined = <T>(obj: T): NullToUndefined<T> => {
  if (obj === null) {
    return undefined as NullToUndefined<T>
  }
  
  if (obj instanceof Date) {
    return obj as NullToUndefined<T>
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => nullToUndefined(item)) as NullToUndefined<T>
  }
  
  if (typeof obj === 'object') {
    const result: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(obj)) {
      result[key] = nullToUndefined(value)
    }
    
    return result as NullToUndefined<T>
  }
  
  return obj as NullToUndefined<T>
} 
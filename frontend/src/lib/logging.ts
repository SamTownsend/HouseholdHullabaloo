export function devLog(...args: unknown[]): void {
  if (import.meta.env.DEV && import.meta.env.MODE !== 'test') {
    console.log(...args)
  }
}

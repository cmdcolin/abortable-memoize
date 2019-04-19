export class AbortError extends Error {
  public code: string
  public constructor(message: string) {
    super(message)
    this.code = 'ERR_ABORTED'
  }
}
/*
 * Takes a function that has one argument, abortSignal, that returns a promise
 * and it works by retrying the function if a previous attempt to initialize the parse cache was aborted
 */
export class AbortAwareCache {
  private cache: Map<(abortSignal: AbortSignal) => Promise<any>, any> = new Map()

  public abortableMemoize(
    fn: (abortSignal?: AbortSignal) => Promise<any>,
  ): (abortSignal?: AbortSignal) => Promise<any> {
    const { cache } = this
    return function abortableMemoizeFn(abortSignal?: AbortSignal) {
      if (!cache.has(fn)) {
        const fnReturn = fn(abortSignal)
        cache.set(fn, fnReturn)
        if (abortSignal) {
          fnReturn.catch(() => {
            if (abortSignal.aborted) cache.delete(fn)
          })
        }
        return cache.get(fn)
      }
      return cache.get(fn).catch((e: AbortError | DOMException) => {
        if (e.code === 'ERR_ABORTED' || e.name === 'AbortError') {
          return fn(abortSignal)
        }
        throw e
      })
    }
  }
}

import AbortError from './abortError'

export {AbortError}

/*
 * Takes a function that has one argument, abortSignal, that returns a promise
 * and it works by retrying the function if a previous attempt to initialize the parse cache was aborted
 */
export class AbortAwareMemoize<T> {
  private cache: Map<(abortSignal: AbortSignal) => Promise<T>, Promise<T>> = new Map()

  public abortableMemoize(
    fn: (abortSignal?: AbortSignal) => Promise<T>,
  ): (abortSignal?: AbortSignal) => Promise<T> {
    const { cache } = this
    return function abortableMemoizeFn(abortSignal?: AbortSignal) {
      const res = cache.get(fn)
      if (!res) {
        const fnReturn = fn(abortSignal)
        cache.set(fn, fnReturn)
        if (abortSignal) {
          fnReturn.catch(() => {
            if (abortSignal.aborted) cache.delete(fn)
          })
        }
        return fnReturn
      }
      return res.catch((e: AbortError | DOMException) => {
        if (e.code === 'ERR_ABORTED' || e.name === 'AbortError') {
          return fn(abortSignal)
        }
        throw e
      })
    }
  }
}

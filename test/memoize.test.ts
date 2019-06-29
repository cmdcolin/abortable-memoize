import {AbortError,AbortAwareMemoize} from '../src/'

class HalfAbortController {
  public signal: any
  public constructor() {
    this.signal = { aborted: false }
  }

  public abort(): void {
    this.signal.aborted = true
  }
}


/**
 * Properly check if the given AbortSignal is aborted.
 * Per the standard, if the signal reads as aborted,
 * this function throws either a DOMException AbortError, or a regular error
 * with a `code` attribute set to `ERR_ABORTED`.
 *
 * For convenience, passing `undefined` is a no-op
 *
 * @param {AbortSignal} [signal] an AbortSignal, or anything with an `aborted` attribute
 * @returns nothing
 */
export function checkAbortSignal(signal?: AbortSignal): void {
  if (!signal) return

  if (signal.aborted) {
    // console.log('bam aborted!')
    if (typeof DOMException !== 'undefined')
      // eslint-disable-next-line  no-undef
      throw new DOMException('aborted', 'AbortError')
    else {
      const e = new AbortError('aborted')
      e.code = 'ERR_ABORTED'
      throw e
    }
  }
}
test('test memoize', async () => {
  let res
  const ti = new AbortAwareMemoize<{hello:string,testOfMemoization?:boolean}>()
  const newFunc = ti.abortableMemoize(() => {
    return new Promise(resolve => {
      resolve({hello: 'world'})
    })
  })
  res = await newFunc()
  // this persists after memoizing since ref to it was saved in the AbortAwareMemoize
  res.testOfMemoization = true
  res = await newFunc()
  expect(res.hello).toEqual('world')
  expect(res.testOfMemoization).toEqual(true)
})

test('test aborting', async () => {
  let res
  const ti = new AbortAwareMemoize<{hello:string}>()
  const newFunc = ti.abortableMemoize((abortSignal) => {
    return new Promise(resolve => {
      checkAbortSignal(abortSignal)
      resolve({hello: 'world'})
    })
  })
  const aborter = new HalfAbortController()
  aborter.abort()
  await expect(newFunc(aborter.signal)).rejects.toThrow(/aborted/)
  // this persists after memoizing since ref to it was saved in the AbortAwareMemoize
  const aborter2 = new HalfAbortController()
  res = await newFunc(aborter2.signal)
  expect(res.hello).toEqual('world')
})



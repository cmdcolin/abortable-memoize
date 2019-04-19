# abortable-memoize

Allows memoizing a function that can be aborted. Redispatches if the thing that was cached was aborted

## Usage

    const newFunc = ti.abortableMemoize(() => {
      return new Promise(resolve => {
        resolve({hello: 'world'})
      })
    })
    res = await newFunc()
    // this persists after memoizing since ref to it was saved in the AbortAwareCache
    res.testOfMemoization = true
    res = await newFunc()
    expect(res.hello).toEqual('world')
    expect(res.testOfMemoization).toEqual(true)

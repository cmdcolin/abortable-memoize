export default class AbortError extends Error {
  public code: string
  public constructor(message: string) {
    super(message)
    this.code = 'ERR_ABORTED'
  }
}

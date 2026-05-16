export class Either<L, R> {
  private readonly _isLeft: boolean
  private readonly _value: L | R

  private constructor(_isLeft: boolean, _value: L | R) {
    this._isLeft = _isLeft
    this._value = _value
  }

  static left<L, R>(value: L): Either<L, R> {
    return new Either<L, R>(true, value)
  }

  static right<L, R>(value: R): Either<L, R> {
    return new Either<L, R>(false, value)
  }

  get isLeft(): boolean {
    return this._isLeft
  }

  get isRight(): boolean {
    return !this._isLeft
  }

  get left(): L {
    if (!this._isLeft) throw new Error('Cannot get left from right')
    return this._value as L
  }

  get right(): R {
    if (this._isLeft) throw new Error('Cannot get right from left')
    return this._value as R
  }

  map<T>(fn: (value: R) => T): Either<L, T> {
    return this._isLeft
      ? (Either.left(this._value as L) as Either<L, T>)
      : Either.right(fn(this._value as R))
  }

  mapLeft<T>(fn: (value: L) => T): Either<T, R> {
    return this._isLeft
      ? Either.left(fn(this._value as L))
      : (Either.right(this._value as R) as Either<T, R>)
  }

  fold<T>(onLeft: (value: L) => T, onRight: (value: R) => T): T {
    return this._isLeft ? onLeft(this._value as L) : onRight(this._value as R)
  }
}

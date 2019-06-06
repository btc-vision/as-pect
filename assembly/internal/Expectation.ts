import { exactComparison } from "./comparison/exactComparison";
import { blockComparison } from "./comparison/blockComparison";
import { truthyComparison } from "./comparison/truthyComparison";
import { referenceComparison } from "./comparison/referenceComparison";
import { falsyComparison } from "./comparison/falsyComparison";
import { tryCallComparison } from "./comparison/tryCallComparison";
import { greaterThanComparison } from "./comparison/greaterThanComparison";
import { greaterThanOrEqualToComparison } from "./comparison/greaterThanOrEqualToComparison";
import { lessThanComparison } from "./comparison/lessThanComparison";
import { lessThanOrEqualToComparison } from "./comparison/lessThanOrEqualToComparison";
import { nullComparison } from "./comparison/nullComparison";
import { closeToComparison } from "./comparison/closeToComparison";
import { isNaNComparison } from "./comparison/isNaNComparison";
import { finiteComparison } from "./comparison/finiteComparison";
import { lengthComparison } from "./comparison/lengthComparison";
import { toIncludeComparison } from "./comparison/toIncludeComparison";
import { toIncludeEqualComparison } from "./comparison/toIncludeEqualComparison";
import { arrayComparison } from "./comparison/arrayComparison";

/**
 * The AssemblyScript class that represents an expecation.
 */
// @ts-ignore: Decorators *are* valid here
@global
export class Expectation<T> {
  /**
   * This i32 is set to 1 if the expectation is negated. Using the _not (xor) condition assertion
   * makes assertions very easy to write and understand.
   */
  _not: i32 = 0;

  /** This is the actual value. */
  actual: T;

  /**
   * Construct an assertion.
   *
   * @param {T} actual - The actual value.
   */
  constructor(actual: T) {
    this.actual = actual;
  }

  /**
   * This property negates the assertion by setting the internal _not property.
   */
  public get not(): Expectation<T> {
    this._not = 1;
    return this;
  }

  /**
   * This method reports value and reference equality.
   *
   * @param {T} expected - The expected value.
   * @param {string} message - The message that describes this assertion.
   */
  public toBe(expected: T, message: string = ""): void {
    // assert value or reference equality
    exactComparison<T>(this.actual, expected, this._not, message);
  }

  /**
   * This method reports strict equality on bytes. It has a special path for ArrayBuffers.
   *
   * @param {T} expected - The expected value.
   * @param {string} message - The message that describes this assertion.
   */
  public toStrictEqual(expected: T, message: string = ""): void {
    // if T is not a reference, use exactComparison
    if (!isReference<T>()) {
      exactComparison<T>(this.actual, expected, this._not, message);
      return;
    }

    // if T is an array, use arrayComparison
    if (isArray<T>()) {
      arrayComparison<T>(this.actual, expected, this._not, message);
      return;
    }

    // Strings and ArrayBuffer must compare their size, so use blockComparison
    if (expected instanceof ArrayBuffer || expected instanceof String) {
      blockComparison<T>(this.actual, expected, this._not, message);
      return;
    }

    // T is a reference, use referenceComparison
    referenceComparison<T>(this.actual, expected, this._not, message);
  }

  /**
   * This exactly compares two different blocks of memory of type `T`.
   *
   * @param {T} expected - This is the expected block reference.
   * @param {string} message - The message that describes this expectation.
   */
  public toBlockEqual(expected: T, message: string = ""): void {
    blockComparison<T>(this.actual, expected, this._not, message);
  }

  public toBeTruthy(message: string = ""): void {
    truthyComparison<T>(this.actual, this._not, message);
  }

  public toBeFalsy(message: string = ""): void {
    falsyComparison<T>(this.actual, this._not, message);
  }

  public toThrow(message: string = ""): void {
    tryCallComparison<T>(this.actual, this._not, message);
  }

  public toBeGreaterThan(expected: T, message: string = ""): void {
    greaterThanComparison<T>(this.actual, expected, this._not, message);
  }

  public toBeGreaterThanOrEqualTo(expected: T, message: string = ""): void {
    greaterThanOrEqualToComparison<T>(this.actual, expected, this._not, message);
  }

  public toBeLessThan(expected: T, message: string = ""): void {
    lessThanComparison<T>(this.actual, expected, this._not, message);
  }

  public toBeLessThanOrEqualTo(expected: T, message: string = ""): void {
    lessThanOrEqualToComparison<T>(this.actual, expected, this._not, message);
  }

  public toBeNull(message: string = ""): void {
    nullComparison<T>(this.actual, this._not, message);
  }

  public toBeCloseTo(expected: T, decimalPlaces: i32 = 2, message: string = ""): void {
    closeToComparison<T>(this.actual, expected, decimalPlaces, this._not, message);
  }

  public toBeNaN(message: string = ""): void {
    isNaNComparison<T>(this.actual, this._not, message);
  }


  public toBeFinite(message: string = ""): void {
    finiteComparison<T>(this.actual, this._not, message);
  }

  public toHaveLength(expected: i32, message: string = ""): void {
    lengthComparison<T>(this.actual, expected, this._not, message);
  }

  public toInclude<U>(expected: U, message: string = ""): void {
    if (isArray<T>(this.actual)) {
      // @ts-ignore Array<U> instanceof check
      toIncludeComparison<T, U>(this.actual, expected, this._not, message);
    } else {
      assert(false, "toInclude expression called on non-Array.");
    }
  }

  public toIncludeEqual<U>(expected: U, message: string = ""): void {
    if (isArray<T>(this.actual)) {
      // @ts-ignore Array<U> instanceof check
      toIncludeEqualComparison<T, U>(this.actual, expected, this._not, message);
    } else {
      assert(false, "toIncludeEqual expression call on non-Array");
    }
  }
}

/**
 * Global exported function expected. Used to describe an expectation.
 *
 * @param {T} actual - The actual value of the expectation
 */
// @ts-ignore: decorators *are* valid here
@global
export function expect<T>(actual: T): Expectation<T> {
  return new Expectation<T>(actual);
}

/**
 * A shorthand for `expect<(): => void>(callback: () => void)`.
 *
 * @param {() => void} cb - The callback to be tested.
 */
// @ts-ignore: decorators *are* valid here
@global
export function expectFn(cb: () => void): Expectation<() => void> {
  return new Expectation<() => void>(cb);
}

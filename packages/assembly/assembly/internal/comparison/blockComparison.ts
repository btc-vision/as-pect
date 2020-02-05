import { exactComparison } from "./exactComparison";
import { assert } from "./assert";
import { reportExpectedReference, Expected } from "../report/Expected";
import { reportActualReference, Actual } from "../report/Actual";
import { BLOCK_OVERHEAD, BLOCK } from "rt/common";
/**
 * This method performs a block comparison. It's useful for comparing a string or an ArrayBuffer
 * which are essentially allocated blocks. The size of each block is an `i32` at `pointer - 4` which
 * is used by the memory.comare() function to validate if two memory blocks equal each other.
 *
 * @param T - The block type.
 * @param {T} actual - The actual value.
 * @param {T} expected - The expected value.
 * @param {i32} negated - The indicator if the assertion is negated.
 * @param {string} message - The message describing the assertion.
 */
export function blockComparison<T>(actual: T, expected: T, negated: i32, message: string): void {

  /**
   * If the pointers are equal, we can perform an exactComparison instead.
   */
  if (actual === expected) {
    exactComparison<T>(actual, expected, negated, message);
    return;
  }

  /**
   * The pointers are not the same, therefore we need to validate that the blocks match each other.
   * These should be `const` declarations, but these are not supported by AssemblyScript yet.
   */
  let expectedPtr = changetype<usize>(expected);
  let actualPtr = changetype<usize>(actual);

  /**
   * The `i32` block sizes exist at `pointer - 4`.
   */
  let expectedSize = changetype<BLOCK>(expectedPtr - BLOCK_OVERHEAD).rtSize;
  let actualSize = changetype<BLOCK>(actualPtr - BLOCK_OVERHEAD).rtSize;


  if (isNullable<T>()) {
    // report the expected reference
    if (expected === null) {
      // @ts-ignore: this is valid assemblyscript
      Expected.report<T>(null, negated);
    } else {
      reportExpectedReference<T>(expectedPtr, expectedSize, negated);
    }

    // report the actual reference
    if (actual === null) {
      // @ts-ignore this is valid AssemblyScript
      Actual.report<T>(null);
    } else {
      reportActualReference<T>(actualPtr, actualSize);
    }
  } else {
    reportExpectedReference<T>(expectedPtr, expectedSize, negated);
    reportActualReference<T>(actualPtr, actualSize);
  }

  if (isNullable<T>()) {
    /**
     * Determine if either the actual or expected reference is null.
     */
    let actualNull = i32(actual === null);
    let expectedNull = i32(expected === null);

    /**
     * It is not possible for both values to be null at this point, because of previous assertions,
     * so they may only be null in a mutually exclusive manner. If that is the case, then we assert
     * `negated` because they are expected to equal each other unless the expectation is negated.
     */
    if (actualNull ^ expectedNull) {
      assert(negated, message);
      return;
    }
  }

  /**
   * Next we need to validate that the blocks are the same size. If they are not, we do not need
   * to perform a `memory.compare()` and can short circut the comparison.
   */
  let lengthEqual = actualSize == expectedSize;

  if (!lengthEqual) {
    assert(negated, message);
  } else {
    /**
     * Next perform a memory compare. If the value is `0`, the blocks equal each other.
     */
    let blocksEqual = memory.compare(actualPtr, expectedPtr, actualSize) == 0;
    assert(negated ^ i32(blocksEqual), message);
  }
}

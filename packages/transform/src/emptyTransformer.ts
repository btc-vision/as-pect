import { Parser } from "@btc-vision/assemblyscript";
import { Transform } from "@btc-vision/assemblyscript/transform";

/**
 * Just an empty transformer.
 */
export default class AspectTransform extends Transform {
  // @ts-ignore
  afterParse(_parser: Parser): void {}
}

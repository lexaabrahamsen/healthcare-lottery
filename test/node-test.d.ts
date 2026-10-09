// Minimal typings for Node's built-in test runner. @types/node couldn't be installed
// in the build environment; delete this file once it (or Vitest) is added.
declare module "node:test" {
  type Fn = () => void | Promise<void>;
  export function describe(name: string, fn: Fn): void;
  export function it(name: string, fn: Fn): void;
}
declare module "node:assert/strict" {
  interface Assert {
    (value: unknown, message?: string): asserts value;
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    ok(value: unknown, message?: string): asserts value;
    throws(fn: () => unknown, expected?: RegExp | Function, message?: string): void;
  }
  const assert: Assert;
  export default assert;
}

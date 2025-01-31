import { TestContext } from "../src";
import { VerboseReporterWrapper } from "./setup/VerboseReporterWrapper.js";
import { promises as fs } from "fs";
import { instantiate } from "@assemblyscript/loader";
import { WASI } from "wasi";
import { jest } from '@jest/globals';
import { WASIOptions } from "node:wasi";

test("snapshots", async () => {
  const reporter = new VerboseReporterWrapper();
  const binary = await fs.readFile("./assembly/jest-wasi.wasm");
  const config: WASIOptions = {
    version: "unstable",
    args: process.argv,
    env: process.env,
    preopens: {}
  };
  const wasi = new WASI(config);
  const ctx = new TestContext({
    reporter,
    binary,
    fileName: "./assembly/jest-wasi.ts",
    wasi,
  });
  // @ts-ignore
  wasi.start = jest.fn((instance: WebAssembly.Instance) => {
    const symbols = Object.getOwnPropertySymbols(wasi);
    const kStartedSymbol = symbols.filter((symbol) =>
      symbol.toString().toLowerCase().includes("started"),
    )[0];
    const setMemorySymbol = symbols.filter((symbol) =>
      symbol.toString().toLowerCase().includes("setmemory"),
    )[0];
    // @ts-ignore
    wasi[setMemorySymbol](instance.exports.memory);
    // @ts-ignore
    wasi[kStartedSymbol] = true;
    // @ts-ignore
    instance.exports._start();
  });
  ctx.run(await instantiate(binary, ctx.createImports()));
  expect(ctx).toBeDefined();
  expect(ctx.pass).toBeTruthy();

  // @ts-ignore
  for (const [name, values] of reporter.snapshots.entries()) {
    for (const value of values) {
      expect(value).toMatchSnapshot(name);
    }
  }
});

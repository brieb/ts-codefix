import ts from "typescript";
import { RunOptions, pass, fail } from "ts-jest-runner";
import { createLanguageServiceHost, applyTextChanges } from "./utils";

export default function run({
  testPath: fileName,
  config,
  extraOptions: { tsCompilerOptions, fixId },
}: RunOptions<{ fixId?: string }>) {
  const start = Date.now();

  if (!fixId) {
    return fail({
      start,
      end: Date.now(),
      test: { path: fileName, errorMessage: "fixId not provided" },
    });
  }

  const serviceHost = createLanguageServiceHost({
    basePath: config.rootDir,
    fileNames: [fileName],
    options: tsCompilerOptions,
  });
  const service = ts.createLanguageService(serviceHost);
  const { changes } = service.getCombinedCodeFix({ type: "file", fileName }, fixId, {}, {});
  if (changes.length > 0) {
    const { textChanges } = changes[0];
    const text = ts.sys.readFile(fileName)!;
    const newText = applyTextChanges(text, textChanges);
    ts.sys.writeFile(fileName, newText);

    return pass({ start, end: Date.now(), test: { path: fileName, title: `Applied ${fixId}` } });
  }

  return pass({ start, end: Date.now(), test: { path: fileName, title: "No changes" } });
}

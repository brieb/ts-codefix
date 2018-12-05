import program from "commander";
import path from "path";
import { tsJestRunner } from "ts-jest-runner";

program
  .version(require("../package.json").version)
  .option("-f, --fixId <fixId>", "TypeScript codefix ID")
  .parse(process.argv);

if (!program.fixId) {
  program.help();
}

tsJestRunner({
  rootDir: process.cwd(),
  runFile: path.join(__dirname, "./run"),
  extraOptions: {
    fixId: program.fixId,
  },
  useBabelRegister: false,
});

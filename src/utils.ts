import ts from "typescript";

export interface CreateLanguageServiceHostOptions {
  basePath: string;
  options: ts.CompilerOptions;
  fileNames: string[];
}

export function createLanguageServiceHost({
  basePath,
  options,
  fileNames,
}: CreateLanguageServiceHostOptions): ts.LanguageServiceHost {
  const fileVersions: { [fileName: string]: number } = {};

  return {
    getCompilationSettings() {
      return options;
    },
    getScriptFileNames() {
      return fileNames;
    },
    getScriptVersion(fileName) {
      if (fileVersions[fileName] == null) {
        fileVersions[fileName] = 0;
      }

      return fileVersions[fileName].toString();
    },
    getScriptSnapshot(fileName) {
      return ts.sys.fileExists(fileName)
        ? ts.ScriptSnapshot.fromString(ts.sys.readFile(fileName)!)
        : undefined;
    },
    getCurrentDirectory() {
      return basePath;
    },
    getDefaultLibFileName(options) {
      return ts.getDefaultLibFilePath(options);
    },
    getNewLine() {
      return ts.sys.newLine;
    },
    useCaseSensitiveFileNames() {
      return ts.sys.useCaseSensitiveFileNames;
    },
    readDirectory: ts.sys.readDirectory,
    readFile: ts.sys.readFile,
    writeFile: ts.sys.writeFile,
    realpath: ts.sys.realpath,
    fileExists: ts.sys.fileExists,
    getDirectories(directoryName) {
      return ts.sys.directoryExists(directoryName) ? ts.sys.getDirectories(directoryName) : [];
    },
    resolveModuleNames(moduleNames, containingFile) {
      return moduleNames.map(moduleName => {
        const result = ts.resolveModuleName(moduleName, containingFile, options, {
          fileExists: ts.sys.fileExists,
          readFile: ts.sys.readFile,
        });

        return result.resolvedModule!;
      });
    },
  };
}

export function applyTextChanges(text: string, changes: ts.TextChange[]): string {
  for (let i = changes.length - 1; i >= 0; i--) {
    const { span, newText } = changes[i];
    text = `${text.substring(0, span.start)}${newText}${text.substring(span.start + span.length)}`;
  }
  return text;
}

import { window, workspace, Uri } from "vscode";
import * as path from "path";
import { paramCase, camelCase, pascalCase, snakeCase } from "change-case";

import { Case, Config } from "./config";

export const prompt = async (question: string) => {
  const answer = await window.showInputBox({
    prompt: question,
  });
  return answer;
};

export const getConfig = (uri: Uri) =>
  workspace.getConfiguration(
    "react-rename",
    workspace.getWorkspaceFolder(uri),
  ) as Config;

export const readFile = async filePath => {
  const text = await workspace.fs.readFile(Uri.file(filePath));
  return new TextDecoder("utf8").decode(text);
};

export const writeFile = async (filePath, content) => {
  const text = new TextEncoder().encode(content);
  await workspace.fs.writeFile(Uri.file(filePath), text);
};

export const renameFile = async (filePath: string, newBaseName: string) => {
  const newName = newBaseName + path.extname(filePath);
  const newPath = path.join(path.dirname(filePath), newName);
  await workspace.fs.rename(Uri.file(filePath), Uri.file(newPath));
};

export const renameFolder = async (folderPath: string, newName: string) => {
  const newPath = path.join(path.dirname(folderPath), newName);
  await workspace.fs.rename(Uri.file(folderPath), Uri.file(newPath));
};

const changeCase = (
  input: string,
  casing: Case | undefined,
  defaultCasing: Case,
): string => {
  if (casing === "camel") return camelCase(input);
  if (casing === "pascal") return pascalCase(input);
  if (casing === "snake") return snakeCase(input);
  if (casing === "kebab") return paramCase(input);
  return changeCase(input, defaultCasing, defaultCasing);
};

export const classNameCase = (input: string, config: Config): string =>
  changeCase(input, config.classNaming, "kebab");

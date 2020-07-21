import { Uri, window } from "vscode";
import * as fs from "fs";
import * as path from "path";

import { Config } from "./config";

import { prompt, renameFile, renameFolder, getConfig } from "./utils";
import transformStyleSheet from "./transform-style-sheet";
import transformComponent from "./transform-component";

export const renameComponent = (uri: Uri) => {
  const config = getConfig(uri);
  fs.lstatSync(uri.fsPath).isDirectory()
    ? renameFromFolder(uri.fsPath, config)
    : renameFromFile(uri.fsPath, config);
};

const getName = () => prompt("New component file name");

const findStyleFiles = (folderPath, name) =>
  [".scss", ".less", ".sass", ".css"]
    .map(ext => path.join(folderPath, name + ext))
    .filter(p => fs.existsSync(p));

const renameFromFolder = async (folderPath: string, config: Config) => {
  const name = path.basename(folderPath);

  const components = [".jsx", ".tsx", ".js", ".ts"]
    .map(ext => path.join(folderPath, name + ext))
    .filter(p => fs.existsSync(p));

  if (components.length === 0) {
    window.showErrorMessage(`Found no component file named '${name}'`);
  }

  const newName = await getName();
  if (!newName) return;

  await Promise.all(
    components.map(async filePath => {
      await transformComponent(filePath, name, newName, config);
      await renameFile(filePath, newName);
    }),
  );

  await Promise.all(
    findStyleFiles(folderPath, name).map(async filePath => {
      await transformStyleSheet(filePath, name, newName, config);
      await renameFile(filePath, newName);
    }),
  );

  await renameFolder(folderPath, newName);
};

const renameFromFile = async (filePath: string, config: Config) => {
  const name = path.basename(filePath, path.extname(filePath));
  const folderPath = path.dirname(filePath);

  if (name === path.basename(folderPath)) {
    renameFromFolder(folderPath, config);
    return;
  }

  const newName = await getName();
  if (!newName) return;

  await transformComponent(filePath, name, newName, config);
  await renameFile(filePath, newName);

  findStyleFiles(folderPath, name).forEach(async filePath => {
    await transformStyleSheet(filePath, name, newName, config);
    await renameFile(filePath, newName);
  });
};

import { Config } from "./config";
import { classNameCase, readFile, writeFile } from "./utils";

export default async function transformStyleSheet(
  filePath: string,
  oldName: string,
  newName: string,
  config: Config,
) {
  const source = await readFile(filePath);
  const pattern = new RegExp(`\.${classNameCase(oldName, config)}`, "g");
  const newSource = source.replace(
    pattern,
    `.${classNameCase(newName, config)}`,
  );
  await writeFile(filePath, newSource);
}

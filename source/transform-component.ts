import generate from "@babel/generator";
import traverse from "@babel/traverse";
import { parse } from "@babel/parser";
import { pascalCase } from "change-case";

import { classNameCase, readFile, writeFile } from "./utils";
import { Config } from "./config";

export default async function transformComponent(
  filePath: string,
  oldName: string,
  newName: string,
  config: Config,
) {
  const source = await readFile(filePath);
  const ast = parse(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const classNamePattern = new RegExp(`^${classNameCase(oldName, config)}`);

  traverse(ast, {
    Program: path => {
      path.scope.rename(pascalCase(oldName), pascalCase(newName));
    },
    JSXAttribute: path => {
      if (path.node.name.name === "className") {
        path.traverse({
          StringLiteral: path => {
            path.node.value = path.node.value
              .split(/\s+/g)
              .map(className =>
                className.replace(
                  classNamePattern,
                  classNameCase(newName, config),
                ),
              )
              .join(" ");
          },
        });
      }
      path.skip();
    },
  });
  const newSource = generate(ast).code;
  await writeFile(filePath, newSource);
}

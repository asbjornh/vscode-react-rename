"use strict";
import { commands, ExtensionContext, Uri, window } from "vscode";

import { renameComponent } from "./rename-component";

export function activate(context: ExtensionContext) {
  const command = commands.registerCommand(
    "extension.rename",
    (uri: Uri | undefined) => {
      const documentUri = window.activeTextEditor?.document.uri;

      if (uri) {
        renameComponent(uri);
      } else if (documentUri) {
        renameComponent(documentUri);
      } else {
        window.showErrorMessage("Failed to rename: No file or folder selected");
      }
    },
  );

  context.subscriptions.push(command);
}

export function deactivate() {}

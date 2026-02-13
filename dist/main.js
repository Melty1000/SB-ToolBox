"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var import_promises = __toESM(require("fs/promises"));
var import_electron_serve = __toESM(require("electron-serve"));
var appServe = (0, import_electron_serve.default)({ directory: import_path.default.join(__dirname, "../out") });
var isDev = process.env.NODE_ENV === "development" || !import_electron.app.isPackaged;
var createWindow = () => {
  const win = new import_electron.BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    // Frameless for Melt UI
    icon: import_path.default.join(__dirname, "../public/assets/icon.png"),
    titleBarStyle: "hidden",
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: "#050505"
  });
  if (isDev) {
    win.loadURL("http://localhost:3001");
    win.webContents.openDevTools();
  } else {
    appServe(win).then(() => {
      win.loadURL("app://-");
    });
  }
  import_electron.ipcMain.on("window-min", () => win.minimize());
  import_electron.ipcMain.on("window-max", () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  import_electron.ipcMain.on("window-close", () => {
    win.destroy();
    import_electron.app.quit();
  });
  import_electron.ipcMain.handle("fs:selectFolder", async () => {
    const result = await import_electron.dialog.showOpenDialog(win, {
      properties: ["openDirectory"]
    });
    const filePaths = result.filePaths || (Array.isArray(result) ? result : null);
    const canceled = result.canceled || !filePaths;
    if (canceled || !filePaths || !filePaths.length) return null;
    const folderPath = filePaths[0];
    const files = await import_promises.default.readdir(folderPath);
    const scripts = {};
    for (const file of files) {
      if (file.endsWith(".cs")) {
        const content = await import_promises.default.readFile(import_path.default.join(folderPath, file), "utf-8");
        scripts[file] = content;
      }
    }
    return scripts;
  });
  import_electron.ipcMain.handle("fs:selectFiles", async (_, options) => {
    const result = await import_electron.dialog.showOpenDialog(win, {
      properties: ["openFile", "multiSelections"],
      filters: (options == null ? void 0 : options.filters) || [{ name: "C# Scripts", extensions: ["cs"] }]
    });
    const filePaths = result.filePaths || (Array.isArray(result) ? result : null);
    const canceled = result.canceled || !filePaths;
    if (canceled || !filePaths || !filePaths.length) return null;
    const scripts = {};
    for (const filePath of filePaths) {
      const name = import_path.default.basename(filePath);
      const content = await import_promises.default.readFile(filePath, "utf-8");
      scripts[name] = content;
    }
    return scripts;
  });
  import_electron.ipcMain.handle("fs:readTextFile", async (_, filePath) => {
    try {
      return await import_promises.default.readFile(filePath, "utf-8");
    } catch (e) {
      return null;
    }
  });
};
import_electron.app.whenReady().then(() => {
  createWindow();
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
import_electron.app.on("before-quit", () => {
  import_electron.ipcMain.removeAllListeners();
});
import_electron.app.on("window-all-closed", () => {
  import_electron.app.quit();
  setTimeout(() => {
    process.exit(0);
  }, 1e3);
});

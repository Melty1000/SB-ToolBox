"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
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
var import_electron2 = require("electron");
var import_path2 = __toESM(require("path"));
var import_promises = __toESM(require("fs/promises"));
var import_electron_serve = __toESM(require("electron-serve"));

// electron/SettingsStore.ts
var import_path = __toESM(require("path"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_electron = require("electron");
var SettingsStore = class {
  constructor() {
    this.defaultSettings = {
      autoUpdate: true,
      autoDownload: false,
      theme: "graphite-cobalt"
    };
    this.path = import_path.default.join(import_electron.app.getPath("userData"), "settings.json");
    this.data = this.load();
  }
  load() {
    try {
      if (import_fs_extra.default.existsSync(this.path)) {
        return __spreadValues(__spreadValues({}, this.defaultSettings), import_fs_extra.default.readJsonSync(this.path));
      }
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
    return this.defaultSettings;
  }
  get() {
    return this.data;
  }
  set(key, value) {
    this.data[key] = value;
    this.save();
  }
  setAll(settings2) {
    this.data = __spreadValues(__spreadValues({}, this.data), settings2);
    this.save();
  }
  save() {
    try {
      import_fs_extra.default.writeJsonSync(this.path, this.data, { spaces: 4 });
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }
};

// electron/UpdateManager.ts
var import_electron_updater = require("electron-updater");
var UpdateManager = class {
  constructor() {
    this.mainWindow = null;
    this.isChecking = false;
    this.setupListeners();
  }
  setWindow(win) {
    this.mainWindow = win;
  }
  setupListeners() {
    import_electron_updater.autoUpdater.autoDownload = false;
    import_electron_updater.autoUpdater.autoInstallOnAppQuit = true;
    import_electron_updater.autoUpdater.on("checking-for-update", () => {
      console.log("[Updater] Checking for updates...");
      this.pulse("update:status", "checking");
    });
    import_electron_updater.autoUpdater.on("update-available", (info) => {
      console.log("[Updater] Update available:", info.version);
      this.pulse("update:available", info.version);
    });
    import_electron_updater.autoUpdater.on("update-not-available", (info) => {
      console.log("[Updater] Up to date.");
      this.pulse("update:status", "uptodate");
    });
    import_electron_updater.autoUpdater.on("error", (err) => {
      console.error("[Updater] Error:", err);
      this.pulse("update:error", err.message);
    });
    import_electron_updater.autoUpdater.on("download-progress", (progressObj) => {
      this.pulse("update:download-progress", progressObj.percent);
    });
    import_electron_updater.autoUpdater.on("update-downloaded", (info) => {
      console.log("[Updater] Update downloaded:", info.version);
      this.pulse("update:ready", info.version);
    });
  }
  async checkForUpdates() {
    if (this.isChecking) return;
    this.isChecking = true;
    try {
      await import_electron_updater.autoUpdater.checkForUpdates();
    } catch (e) {
      console.error("[Updater] Check failed:", e);
    } finally {
      this.isChecking = false;
    }
  }
  async downloadUpdate() {
    try {
      await import_electron_updater.autoUpdater.downloadUpdate();
    } catch (e) {
      console.error("[Updater] Download failed:", e);
    }
  }
  quitAndInstall() {
    import_electron_updater.autoUpdater.quitAndInstall();
  }
  pulse(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }
};

// electron/main.ts
var appServe = (0, import_electron_serve.default)({ directory: import_path2.default.join(__dirname, "../out") });
var isDev = process.env.NODE_ENV === "development" || !import_electron2.app.isPackaged;
var settings = new SettingsStore();
var updateManager = new UpdateManager();
var createWindow = () => {
  const win = new import_electron2.BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    // Frameless for Melt UI
    icon: import_path2.default.join(__dirname, "../public/assets/icon.png"),
    titleBarStyle: "hidden",
    webPreferences: {
      preload: import_path2.default.join(__dirname, "preload.js"),
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
  updateManager.setWindow(win);
  import_electron2.ipcMain.on("window-min", () => win.minimize());
  import_electron2.ipcMain.on("window-max", () => {
    if (win.isMaximized()) win.unmaximize();
    else win.maximize();
  });
  import_electron2.ipcMain.on("window-close", () => {
    win.destroy();
    import_electron2.app.quit();
  });
  import_electron2.ipcMain.handle("fs:selectFolder", async () => {
    const result = await import_electron2.dialog.showOpenDialog(win, {
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
        const content = await import_promises.default.readFile(import_path2.default.join(folderPath, file), "utf-8");
        scripts[file] = content;
      }
    }
    return scripts;
  });
  import_electron2.ipcMain.handle("fs:selectFiles", async (_, options) => {
    const result = await import_electron2.dialog.showOpenDialog(win, {
      properties: ["openFile", "multiSelections"],
      filters: (options == null ? void 0 : options.filters) || [{ name: "C# Scripts", extensions: ["cs"] }]
    });
    const filePaths = result.filePaths || (Array.isArray(result) ? result : null);
    const canceled = result.canceled || !filePaths;
    if (canceled || !filePaths || !filePaths.length) return null;
    const scripts = {};
    for (const filePath of filePaths) {
      const name = import_path2.default.basename(filePath);
      const content = await import_promises.default.readFile(filePath, "utf-8");
      scripts[name] = content;
    }
    return scripts;
  });
  import_electron2.ipcMain.handle("fs:readTextFile", async (_, filePath) => {
    try {
      return await import_promises.default.readFile(filePath, "utf-8");
    } catch (e) {
      return null;
    }
  });
  import_electron2.ipcMain.handle("settings:get-all", () => settings.get());
  import_electron2.ipcMain.handle("settings:set", (_, { key, value }) => {
    settings.set(key, value);
    return true;
  });
  import_electron2.ipcMain.handle("update:check", () => updateManager.checkForUpdates());
  import_electron2.ipcMain.handle("update:download", () => updateManager.downloadUpdate());
  import_electron2.ipcMain.handle("update:quit-and-install", () => updateManager.quitAndInstall());
};
import_electron2.app.whenReady().then(() => {
  createWindow();
  const config = settings.get();
  if (config.autoUpdate && !isDev) {
    setTimeout(() => {
      updateManager.checkForUpdates();
    }, 3e3);
  }
  import_electron2.app.on("activate", () => {
    if (import_electron2.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
import_electron2.app.on("before-quit", () => {
  import_electron2.ipcMain.removeAllListeners();
});
import_electron2.app.on("window-all-closed", () => {
  import_electron2.app.quit();
  setTimeout(() => {
    process.exit(0);
  }, 1e3);
});

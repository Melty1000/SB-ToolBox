"use strict";

// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electron", {
  minimize: () => import_electron.ipcRenderer.send("window-min"),
  maximize: () => import_electron.ipcRenderer.send("window-max"),
  close: () => import_electron.ipcRenderer.send("window-close"),
  fs: {
    selectFolder: () => import_electron.ipcRenderer.invoke("fs:selectFolder"),
    selectFiles: (params) => import_electron.ipcRenderer.invoke("fs:selectFiles", params),
    readTextFile: (path) => import_electron.ipcRenderer.invoke("fs:readTextFile", path)
  },
  settings: {
    getAll: () => import_electron.ipcRenderer.invoke("settings:get-all"),
    set: (key, value) => import_electron.ipcRenderer.invoke("settings:set", { key, value })
  },
  updater: {
    check: () => import_electron.ipcRenderer.invoke("update:check"),
    download: () => import_electron.ipcRenderer.invoke("update:download"),
    quitAndInstall: () => import_electron.ipcRenderer.invoke("update:quit-and-install"),
    on: (channel, callback) => {
      const subscription = (_event, data) => callback(data);
      import_electron.ipcRenderer.on(channel, subscription);
      return () => import_electron.ipcRenderer.removeListener(channel, subscription);
    }
  }
});

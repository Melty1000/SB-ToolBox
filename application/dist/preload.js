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
  }
});

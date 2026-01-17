const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  toggleFullscreen: () => ipcRenderer.invoke("toggle-fullscreen"),
  checkUpdates: () => ipcRenderer.invoke("check-updates"),

  onUpdateStatus: (callback) => {
    ipcRenderer.on("update-status", (_e, msg) => callback(msg));
  }
});

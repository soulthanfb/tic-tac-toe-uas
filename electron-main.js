const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

let mainWindow = null;
let splashWindow = null;

/* ===================== SPLASH WINDOW ===================== */
function createSplash() {
  splashWindow = new BrowserWindow({
    width: 640,
    height: 360,
    resizable: false,
    movable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    center: true,
    backgroundColor: "#00000000",
    webPreferences: {
      contextIsolation: true,
    },
  });

  splashWindow.loadFile(path.join(__dirname, "splash.html"));
}

/* ===================== MAIN WINDOW ===================== */
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 650,
    backgroundColor: "#0f0f0f",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // tutup splash secara halus
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
        splashWindow = null;
      }
    }, 700);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/* ===================== FULLSCREEN ===================== */
function toggleFullscreen() {
  if (!mainWindow) return;
  mainWindow.setFullScreen(!mainWindow.isFullScreen());
}

/* ===================== UPDATE STATUS HELPER ===================== */
function sendUpdateStatus(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("update-status", message);
  }
}

/* ===================== AUTO UPDATER ===================== */
function setupAutoUpdater() {
  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => {
    sendUpdateStatus("Checking update...");
  });

  autoUpdater.on("update-available", () => {
    console.log("UPDATE AVAILABLE");
    sendUpdateStatus("Update tersedia, mengunduh...");
  });

  autoUpdater.on("update-not-available", () => {
    sendUpdateStatus("Tidak ada update.");
  });

  autoUpdater.on("download-progress", (progress) => {
    sendUpdateStatus(`Downloading... ${Math.round(progress.percent)}%`);
  });

  autoUpdater.on("update-downloaded", () => {
    sendUpdateStatus("Update siap, aplikasi akan restart...");
    setTimeout(() => autoUpdater.quitAndInstall(), 1200);
  });

  autoUpdater.on("error", (err) => {
    sendUpdateStatus("Update error: " + (err?.message || err));
  });
}

/* ===================== IPC HANDLERS ===================== */
function setupIPC() {
  ipcMain.handle("toggle-fullscreen", () => {
    toggleFullscreen();
  });

  ipcMain.handle("check-updates", async () => {
    sendUpdateStatus("Checking update...");

    // fallback kalau belum ada GitHub Release
    const fallback = setTimeout(() => {
      sendUpdateStatus(
        "Belum ada server update (GitHub Releases belum tersedia)."
      );
    }, 2500);

    try {
      await autoUpdater.checkForUpdates();
      clearTimeout(fallback);
    } catch (e) {
      clearTimeout(fallback);
      sendUpdateStatus("Update error: " + (e?.message || e));
    }
  });
}

/* ===================== APP READY ===================== */
app.whenReady().then(() => {
  createSplash();
  createMainWindow();
  setupAutoUpdater();
  setupIPC();

  // Shortcut fullscreen
  globalShortcut.register("F11", () => toggleFullscreen());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplash();
      createMainWindow();
    }
  });
});

/* ===================== APP QUIT ===================== */
app.on("window-all-closed", () => {
  globalShortcut.unregisterAll();
  if (process.platform !== "darwin") app.quit();
});

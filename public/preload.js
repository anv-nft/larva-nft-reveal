const { remote, ipcRenderer } = require('electron')
let ElectronPreload = {
    appName: remote.app.getName(),
    appVersion: remote.app.getVersion(),
    app: remote.app,
    dialog: remote.dialog,
    ElectronWebContents: remote.getCurrentWebContents(),
    getCurrentWindow: remote.getCurrentWindow,
    globalShortcut: remote.globalShortcut,
    ipcMain: remote.require('electron').ipcMain,
    ipcRenderer: ipcRenderer,
    Printer: remote.require("electron-pos-printer"),
    updater: remote.require('electron-updater')
}
window.ElectronPreload = ElectronPreload
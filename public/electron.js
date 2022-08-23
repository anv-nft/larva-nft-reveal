const { app, BrowserWindow, Menu, dialog, webContents, globalShortcut, ipcMain } = require('electron');
// const { autoUpdater } = require('electron-updater');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;
let loaderWindow

function createWindow() {
    mainWindow = new BrowserWindow({
        minWidth: 1024,
        minHeight: 600,
        show: true,
        fullscreen: false,
        backgroundColor: '#2e2c29',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            preload: path.join(__dirname, "/preload.js")
        }
    });
    // const startURL = isDev ? 'http://localhost:3000' : `file://${__dirname}/../build/index.html`;

    // mainWindow.loadFile(`${path.join(__dirname, '../build/index.html')}`);
    mainWindow.loadURL(`file:///${__dirname}/loader.html`);
    if (isDev) {
        setTimeout(() => {
            mainWindow.loadURL('http://localhost:3000');
        }, 5000);
    } else {
        setTimeout(() => {
            mainWindow.loadURL(`file:///${__dirname}/index.html`);
        }, 5000);
        Menu.setApplicationMenu(null)
    }

    mainWindow.once('ready-to-show', () => {
        // mainWindow.maximize();
        mainWindow.show();
        mainWindow.maximize();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

}

function createLoaderWindow() {
    mainWindow = new BrowserWindow({
        minWidth: 600,
        minHeight: 600,
        show: true,
        fullscreen: false,
        frame: false,
        backgroundColor: '#0078d4'
    });
}

app.on('ready', () => {
    let main = null
    let loading = new BrowserWindow({ show: false, frame: false, width: 300, height: 300 })

    loading.once('show', () => {
        const { height, width } = require('electron').screen.getPrimaryDisplay();
        main = new BrowserWindow({
            width: width,
            height: height,
            minWidth: 1024,
            minHeight: 600,
            show: false,
            fullscreen: false,
            // backgroundColor: '#0078d4',
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                preload: path.join(__dirname, "/preload.js")
            }
        });
        setTimeout(() => {
            if (isDev) {
                main.loadURL('http://localhost:3000');
            } else {
                main.loadURL(`file:///${__dirname}/index.html`);
                Menu.setApplicationMenu(null)
            }
        }, 3000);
        main.webContents.once('dom-ready', () => {
            setTimeout(() => {
                loading.hide()
                loading.close()
                main.show()
                main.maximize()
            }, 3000);
        })
        // long loading html
    })
    loading.loadURL(`file:///${__dirname}/loader.html`)
    loading.show()
})


app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

const exec = require('child_process').exec;

let deviceData = {}

function puts(key, value, error) {
    var result = value.substring(value.indexOf("\n") + 1).replace(/(\r\n|\n|\r|\s)/gm, "")
    deviceData[key] = result.trim()
}

exec("wmic baseboard get SerialNumber", (error, stdout, stderr) => puts('a', stdout, error));
exec("wmic CPU get ProcessorId", (error, stdout, stderr) => puts('b', stdout, error));
exec("wmic CPU get NumberOfCores", (error, stdout, stderr) => puts('c', stdout, error));


ipcMain.on('deviceId', (event, args) => {
    if (deviceData.a && deviceData.b && deviceData.c) {
        event.sender.send('deviceId', deviceData.a.concat('-', deviceData.b, '-', deviceData.c))
    } else {
        event.sender.send('deviceId', null)
    }
})
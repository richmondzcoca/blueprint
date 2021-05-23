'use strict'

import { app, protocol, BrowserWindow, powerMonitor, ipcMain, Menu, Notification } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import { autoUpdater } from "electron-updater"

const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require("path");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

app.setAppUserModelId('Blueprint')

// Menu.setApplicationMenu(null); // Remove Menus

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 450,
    height: 450,
    center: true,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    }
  })

  win.on('will-resize', (e) => {
    //prevent resizing even if resizable property is true.
    e.preventDefault();
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    win.webContents.openDevTools()
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdater.checkForUpdatesAndNotify()
  }
}

var $notification = undefined

const showNotification = (param) => {
  const icon = path.join(__dirname, 'blueprint.ico')

  if(Notification.isSupported()){
    if($notification){
      $notification.close()
    }

    const notification = {
      title: param.title,
      body: param.body,
      icon: icon
    }
    $notification = new Notification(notification)
    $notification.show()
    return icon
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('asynchronous-message', (event, args) => {
  const $powerMonitor = {
    systemIdleState: powerMonitor.getSystemIdleState(1),
    systemIdleTime: powerMonitor.getSystemIdleTime(),
    seconds: args.seconds
  }
  event.reply('asynchronous-reply', $powerMonitor);
})

ipcMain.on('power-lock-screen',(event) => {
  powerMonitor.on('lock-screen',() => {
    event.reply('response-power-lock-screen', true);
  })
})

ipcMain.on('check-unlock-screen',(event) => {
  powerMonitor.on('unlock-screen',() => {
    event.reply('response-unlock-screen', true);
  })
})

ipcMain.on('show-notification',(event, args) => {
  const iconPath = showNotification(args)
  event.reply('reply-notification',iconPath)
})
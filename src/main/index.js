import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let instructionWindow = null
let answerWindow = null
let questionWindow = null

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.setMenuBarVisibility(false)
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  ipcMain.handle('open-instruction-window', () => {
    if (!instructionWindow || instructionWindow.isDestroyed()) {
      instructionWindow = new BrowserWindow({
        title: 'Instruction Window',
        fullscreen: true,
        frame: false,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      instructionWindow.on('ready-to-show', () => {
        instructionWindow.show()
      })
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        instructionWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], '/#/inst'))
      } else {
        instructionWindow.loadFile(join(__dirname, '../renderer/index.html#/inst'))
      }
    }
  })

  ipcMain.handle('open-answer-window', () => {
    if (!answerWindow || answerWindow.isDestroyed()) {
      answerWindow = new BrowserWindow({
        title: 'Answer Window',
        fullscreen: true,
        frame: false,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      answerWindow.on('ready-to-show', () => {
        answerWindow.show()
      })
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        answerWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], '/#/ans'))
      } else {
        answerWindow.loadFile(join(__dirname, '../renderer/index.html#/ans'))
      }
    }
  })

  ipcMain.handle('open-question-window', () => {
    if (!questionWindow || questionWindow.isDestroyed()) {
      questionWindow = new BrowserWindow({
        title: 'Question Window',
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      questionWindow.on('ready-to-show', () => {
        questionWindow.show()
      })

      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        questionWindow.loadURL(join(process.env['ELECTRON_RENDERER_URL'], '/#/ques'))
      } else {
        questionWindow.loadFile(join(__dirname, '../renderer/index.html#/ques'))
      }
    }
    ;``
  })

  ipcMain.handle('show-screen-numbers', () => {
    if (!questionWindow || questionWindow.isDestroyed()) {
      questionWindow = new BrowserWindow({})
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        questionWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
      } else {
        questionWindow.loadFile(join(__dirname, '../renderer/index.html'))
      }
    }
    questionWindow.on('ready-to-show', () => {
      questionWindow.show()
    })
  })

  ipcMain.handle('server-connection-checker', () => {
    if (!questionWindow || questionWindow.isDestroyed()) {
      questionWindow = new BrowserWindow({
        modal: true,
        width: 200,
        height: 200,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        questionWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/#/connection_checker')
      } else {
        questionWindow.loadFile(join(__dirname, '../renderer/index.html#/connection_checker'))
      }
    }
    questionWindow.on('ready-to-show', () => {
      questionWindow.show()
    })
  })

  let sharedData = {}

  // Handler to set data
  ipcMain.handle('set-shared-data', (event, key, value) => {
    sharedData[key] = value
  })

  // Handler to get data
  ipcMain.handle('get-shared-data', (event, key) => {
    return sharedData[key]
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

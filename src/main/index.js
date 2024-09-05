import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, resolve } from 'path'
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

  const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
    ? process.env['ELECTRON_RENDERER_URL']
    : resolve(__dirname, '../renderer/index.html')
    
  mainWindow.loadURL(urlToLoad)
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
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      instructionWindow.on('ready-to-show', () => {
        instructionWindow.show()
      })
      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#/inst', process.env['ELECTRON_RENDERER_URL']).toString()
        : resolve(__dirname, '../renderer/index.html#/inst')
      instructionWindow.loadURL(urlToLoad)
    }
  })

  ipcMain.handle('open-answer-window', () => {
    if (!answerWindow || answerWindow.isDestroyed()) {
      answerWindow = new BrowserWindow({
        title: 'Answer Window',
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      answerWindow.on('ready-to-show', () => {
        answerWindow.show()
      })
      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#/ans', process.env['ELECTRON_RENDERER_URL']).toString()
        : resolve(__dirname, '../renderer/index.html#/ans')
      answerWindow.loadURL(urlToLoad)
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
      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#/ques', process.env['ELECTRON_RENDERER_URL']).toString()
        : resolve(__dirname, '../renderer/index.html#/ques')
      questionWindow.loadURL(urlToLoad)
    }
  })

  ipcMain.handle('show-screen-numbers', () => {
    if (!questionWindow || questionWindow.isDestroyed()) {
      questionWindow = new BrowserWindow({
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? process.env['ELECTRON_RENDERER_URL']
        : resolve(__dirname, '../renderer/index.html')
      questionWindow.loadURL(urlToLoad)
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
      questionWindow.setAlwaysOnTop(true, 'screen-saver') // 常に最前面に表示する
      questionWindow.setVisibleOnAllWorkspaces(true)
      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#/connection_checker', process.env['ELECTRON_RENDERER_URL']).toString()
        : resolve(__dirname, '../renderer/index.html#/connection_checker')
      questionWindow.loadURL(urlToLoad)
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

  ipcMain.handle('reset-shared-data', () => {
    sharedData = {}
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// JSONで関数実行と対象ウィンドウを指定
ipcMain.on('execute-function', (event, { targetWindow, functionName }) => {
  let target

  switch (targetWindow) {
    case 'AnswerWindow':
      target = answerWindow
      break
    case 'InstructionWindow':
      target = instructionWindow
      break
    case 'QuestionWindow':
      target = questionWindow
      break
    default:
      console.error('Unknown target window:', targetWindow)
      return
  }

  if (target && !target.isDestroyed()) {
    target.webContents.send('invoke-function', { functionName })
  } else {
    console.error('Target window is not available:', targetWindow)
  }
})

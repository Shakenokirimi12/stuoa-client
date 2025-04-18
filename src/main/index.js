import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join, resolve } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png'

let instructionWindow = null
let answerWindow = null
let questionWindow = null
let mainWindow = null
app.commandLine.appendSwitch('disable-gpu-sandbox')
ipcMain.setMaxListeners(2500)

function createWindow() {
  mainWindow = new BrowserWindow({
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

  // Windows と他のプラットフォームで URL を分岐
  const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
    ? process.env['ELECTRON_RENDERER_URL']
    : `file://${resolve(__dirname, process.platform === 'win32' ? '..\\renderer\\index.html' : '../renderer/index.html')}`

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
      instructionWindow.setMenuBarVisibility(false)
      instructionWindow.on('ready-to-show', () => {
        instructionWindow.show()
      })
      instructionWindow.on('closed', () => {
        instructionWindow = null
      })

      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#inst', process.env['ELECTRON_RENDERER_URL']).toString()
        : `file://${resolve(__dirname, process.platform === 'win32' ? '..\\renderer\\index.html#inst' : '../renderer/index.html#/inst')}`

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
      answerWindow.setMenuBarVisibility(false)
      answerWindow.on('ready-to-show', () => {
        answerWindow.show()
      })
      answerWindow.on('closed', () => {
        answerWindow = null
      })

      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#ans', process.env['ELECTRON_RENDERER_URL']).toString()
        : `file://${resolve(__dirname, process.platform === 'win32' ? '..\\renderer\\index.html#ans' : '../renderer/index.html#/ans')}`

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
      questionWindow.setMenuBarVisibility(false)
      questionWindow.on('ready-to-show', () => {
        questionWindow.show()
      })
      questionWindow.on('closed', () => {
        questionWindow = null
      })

      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#ques', process.env['ELECTRON_RENDERER_URL']).toString()
        : `file://${resolve(__dirname, process.platform === 'win32' ? '..\\renderer\\index.html#ques' : '../renderer/index.html#/ques')}`

      questionWindow.loadURL(urlToLoad)
    }
  })

  let connectionChecker = null

  ipcMain.handle('server-connection-checker', () => {
    if (!connectionChecker || connectionChecker.isDestroyed()) {
      connectionChecker = new BrowserWindow({
        modal: true,
        width: 200,
        height: 200,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false
        }
      })
      connectionChecker.setMenuBarVisibility(false)
      connectionChecker.setAlwaysOnTop(true, 'screen-saver') // 常に最前面に表示する
      connectionChecker.setVisibleOnAllWorkspaces(true)

      const urlToLoad = is.dev && process.env['ELECTRON_RENDERER_URL']
        ? new URL('#connection_checker', process.env['ELECTRON_RENDERER_URL']).toString()
        : `file://${resolve(__dirname, process.platform === 'win32' ? '..\\renderer\\index.html#connection_checker' : '../renderer/index.html#/connection_checker')}`

      connectionChecker.loadURL(urlToLoad)
    }
    connectionChecker.on('ready-to-show', () => {
      connectionChecker.show()
    })
    connectionChecker.on('closed', () => {
      connectionChecker = null
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

ipcMain.on('execute-function', async (event, { targetWindow, functionName }) => {
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
      event.reply('function-execution-result', { success: false, error: 'Unknown target window' })
      return
  }

  if (target && !target.isDestroyed()) {
    target.webContents.send('invoke-function', { functionName })

    ipcMain.once('function-invoked', (event, result) => {
      event.reply('function-execution-result', { success: true, data: result })
    })
  } else {
    console.error('Target window is not available:', targetWindow)
    event.reply('function-execution-result', { success: false, error: 'Target window not available' })
  }
})

ipcMain.handle('set-fullscreen', () => {
  const allWindows = BrowserWindow.getAllWindows(); // Get all open windows
  allWindows.forEach(window => {
    if (window !== mainWindow && !window.isDestroyed()) {
      window.setFullScreen(true); // Set each window to fullscreen except mainWindow
    }
  });
});

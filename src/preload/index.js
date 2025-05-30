import { contextBridge, ipcRenderer } from 'electron'

const maxListeners = 2500 // Set a reasonable number here
ipcRenderer.setMaxListeners(maxListeners)

contextBridge.exposeInMainWorld('myAPI', {
  openInstructionWindow: async () => {
    try {
      return await ipcRenderer.invoke('open-instruction-window')
    } catch (error) {
      console.error('Failed to open instruction window:', error)
    }
  },
  openQuestionWindow: async () => {
    try {
      return await ipcRenderer.invoke('open-question-window')
    } catch (error) {
      console.error('Failed to open question window:', error)
    }
  },
  openAnswerWindow: async () => {
    try {
      return await ipcRenderer.invoke('open-answer-window')
    } catch (error) {
      console.error('Failed to open answer window:', error)
    }
  },
  showScreenNumbers: async () => {
    try {
      return await ipcRenderer.invoke('show-screen-numbers')
    } catch (error) {
      console.error('Failed to show screen numbers:', error)
    }
  },
  showConnectionChecker: async () => {
    try {
      return await ipcRenderer.invoke('server-connection-checker')
    } catch (error) {
      console.error('Failed to check server connection:', error)
    }
  },
  getAllScreens: async () => {
    try {
      return await ipcRenderer.invoke('get-all-screens')
    } catch (error) {
      console.error('Failed to get all screens:', error)
    }
  }
})

contextBridge.exposeInMainWorld('globalVariableHandler', {
  setSharedData: async (key, value) => {
    try {
      await ipcRenderer.invoke('set-shared-data', key, value)
    } catch (error) {
      console.error(`Failed to set shared data for key ${key}:, error`)
    }
  },
  getSharedData: async (key) => {
    try {
      return await ipcRenderer.invoke('get-shared-data', key)
    } catch (error) {
      console.error(`Failed to get shared data for key ${key}:, error`)
    }
  },
  resetSharedData: async () => {
    await ipcRenderer.invoke('reset-shared-data')
  }
})

contextBridge.exposeInMainWorld('remoteFunctionHandler', {
  executeFunction: async (targetWindow, functionName) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('function-execution-result', (event, result) => {
        if (result.success) {
          resolve(result.data)
        } else {
          reject(result.error)
        }
      })
      ipcRenderer.send('execute-function', { targetWindow, functionName })
    })
  },
  onInvokeFunction: (callback) => {
    ipcRenderer.removeAllListeners('invoke-function') // 既存のリスナーを削除
    ipcRenderer.on('invoke-function', (event, { functionName }) => {
      callback(functionName)
    })
  }
})

contextBridge.exposeInMainWorld('windowController', {
  setFullScreen: async () => {
    try {
      return await ipcRenderer.invoke('set-fullscreen')
    } catch (error) {
      console.error('Failed to open question window:', error)
    }
  },
})
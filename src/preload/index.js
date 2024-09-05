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
  }
})

contextBridge.exposeInMainWorld('globalVariableHandler', {
  setSharedData: async (key, value) => {
    try {
      await ipcRenderer.invoke('set-shared-data', key, value)
    } catch (error) {
      console.error(`Failed to set shared data for key ${key}:`, error)
    }
  },
  getSharedData: async (key) => {
    try {
      return await ipcRenderer.invoke('get-shared-data', key)
    } catch (error) {
      console.error(`Failed to get shared data for key ${key}:`, error)
    }
  }
})

contextBridge.exposeInMainWorld('remoteFunctionHandler', {
  executeFunction: (targetWindow, functionName) => {
    ipcRenderer.send('execute-function', { targetWindow, functionName })
  },
  onInvokeFunction: (callback) => {
    ipcRenderer.on('invoke-function', (event, { functionName }) => {
      callback(functionName)
    })
  }
})

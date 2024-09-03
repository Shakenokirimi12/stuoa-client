import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

contextBridge.exposeInMainWorld('myAPI', {
  // メインプロセスの 'open-window' チャンネルへ送信
  openInstructionWindow: () => ipcRenderer.invoke('open-instruction-window'),
  openQuestionWindow: () => ipcRenderer.invoke('open-question-window'),
  openAnswerWindow: () => ipcRenderer.invoke('open-answer-window'),
  showScreenNumbers: () => ipcRenderer.invoke('show-screen-numbers'),
  showConnectionChecker: () => ipcRenderer.invoke('server-connection-checker')
})

contextBridge.exposeInMainWorld('globalVariableHandler', {
  setSharedData: async (key, value) => {
    await ipcRenderer.invoke('set-shared-data', key, value)
  },
  getSharedData: async (key) => {
    return await ipcRenderer.invoke('get-shared-data', key)
  }
})

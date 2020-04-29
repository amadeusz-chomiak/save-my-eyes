import { breakIndex } from './store'
import { ipcMain, ipcRenderer } from 'electron-better-ipc'
import { setNewBreak } from './breaker'

export const channelSetBreak = 'set-break'
export const channelGetBreakCount = 'break-count'

export interface OptionsSetBreak {
  forceNextBreakIn: number
}

//? ipc for renderer
export const rendererGetBreakIndex = async (): Promise<number> => {
  return await ipcRenderer.callMain(channelGetBreakCount)
}

export const rendererSetNextBreak = async (
  forceNextBreakIn?: number
): Promise<void> => {
  return await ipcRenderer.callMain(channelSetBreak, { forceNextBreakIn })
}

//? ipc for main
export const useIpcMain = () => {
  ipcMain.answerRenderer(channelGetBreakCount, () => {
    return breakIndex.value
  })

  ipcMain.answerRenderer(channelSetBreak, (options: OptionsSetBreak) => {
    let forceNextBreakIn
    if (options) {
      forceNextBreakIn = options.forceNextBreakIn
    }

    setNewBreak(forceNextBreakIn)
    return true
  })
}

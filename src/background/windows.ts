import { screen, BrowserWindow } from 'electron'
import { isProd, isProdBuild, isDevProdTest } from './env'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'


const windows: {
  windowIndex: undefined | BrowserWindow
  windowTray: undefined | BrowserWindow
} = {
  windowIndex: undefined,
  windowTray: undefined,
}

export const closeAllWindows = () => {
  windows.windowIndex?.close()
  windows.windowTray?.close()
}

const baseWindowSettings: Electron.BrowserWindowConstructorOptions = {
  show: false,
  minimizable: !isProd,
  movable: !isProd,
  fullscreenable: !isProd,
  resizable: !isProd,
  alwaysOnTop: isProd,
  skipTaskbar: isProd,
  frame: !isProd,
  autoHideMenuBar: true,
}

const getPrimaryDisplay = () => screen.getPrimaryDisplay().workAreaSize

type WindowFunction = (window: BrowserWindow) => void

function createWindow(
  windowKey: keyof typeof windows,
  url: string,
  options: Electron.BrowserWindowConstructorOptions,
  extendWindow?: WindowFunction
) {
  // Create the browser window.
  if (!windows[windowKey]) {
    const newWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        devTools: true || !isProdBuild,
      },
      ...options,
    })
    windows[windowKey] = newWindow
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      // Load the url of the dev server if in development mode
      const path = (process.env.WEBPACK_DEV_SERVER_URL as string) + url
      newWindow.loadURL(path)
      if (!process.env.IS_TEST) newWindow.webContents.openDevTools()
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      newWindow.loadURL(`app://./index.html/${url}`)
    }

    newWindow.on('closed', () => {
      windows[windowKey] = undefined
    })

    if (extendWindow) extendWindow(newWindow)
  }
  windows[windowKey]?.show()
}

export const createWindowIndex = async () => {
  const url = '/#/BeforeBreak'
  const { height: screenHeight, width: screenWidth } = getPrimaryDisplay()

  createWindow('windowIndex', url, {
    width: screenWidth,
    height: screenHeight,
    y: 0,
    x: 0,
    backgroundColor: '#00000000',
    transparent: isProd,
    ...baseWindowSettings,
  })
}

export const createWindowTray = async () => {
  const url = '/#/menu'
  const width = 500
  const { height: screenHeight, width: screenWidth } = getPrimaryDisplay()
  const x = screenWidth - width

  createWindow(
    'windowTray',
    url,
    {
      width,
      height: screenHeight,
      y: 0,
      x,
      backgroundColor: '#00000000',
      transparent: isProd,
      ...baseWindowSettings,
    }
  )
}

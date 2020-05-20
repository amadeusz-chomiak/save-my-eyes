import { app, protocol, BrowserWindow } from 'electron'
import { installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import { useTray } from '@/background/tray'
import { isProd, isProdBuild, isDevProdTest } from '@/background/env'
import { setNewBreak } from '@/background/breaker'
import { useIpcMain } from '@/background/ipc'
const isDevelopment = process.env.NODE_ENV !== 'production'
// import {resolve} from 'path'
// __dirname = resolve();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let win: BrowserWindow | null

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
])

app.on('window-all-closed', (e: Event) => e.preventDefault())

// app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // if (win === null) {
  //   createWindow()
  // }
// })

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment) {
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  useIpcMain()

  //@ts-ignore
  app.tray = useTray()

  setNewBreak({})
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

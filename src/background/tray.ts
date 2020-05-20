import { join } from 'path'
import { Tray } from 'electron'
import { isProdBuild } from './env'
import { createWindowTray } from './windows'

export const useTray = () => {
  const tray = new Tray(
    isProdBuild
      ? join('resources', 'app.asar', 'icon.png')
      : join('public', 'icon.png')
  )
  tray.setToolTip('Save your eyes')
  tray.on('click', createWindowTray)
  tray.on('right-click', createWindowTray)
  return tray
}

import { scheduleJob, Job } from 'node-schedule'
import { addSeconds } from 'date-fns'
import { isProd, isProdBuild, isDevProdTest } from './env'
import { createWindowIndex, closeAllWindows } from './windows'
import {
  breakIndex,
  breakId,
  lastSchedulerJobDate,
  lastSchedulerJobLength,
} from './store'
import { getUserSettingsStore } from './db'
// import log from 'electron-log'

let breakSchedule: Job | undefined

const getEveryFromDB = () => {
  return getUserSettingsStore().get('breaks').every
}

const calculateNextBreak = (nextBreakIn: number) => {
  return addSeconds(
    new Date(),
    isProdBuild ? nextBreakIn : isDevProdTest ? 30 : 3
  )
}

export interface NewBreakOptions {
  forceNextBreakIn?: number
  forceNextBreakType?: 'long' | 'short'
}

const getNewBreakIndex = (
  oldIndex: number,
  options: NewBreakOptions
): number => {
  const forced =
    typeof options?.forceNextBreakIn === 'number' ||
    !!options?.forceNextBreakType
  console.log('getNewBreakIndex', 'oldIndex', oldIndex, 'options', options)
  if (!forced) return ++oldIndex
  else {
    const forceNextBreakType = options?.forceNextBreakType
    if (forceNextBreakType) {
      const forceLongBreak = forceNextBreakType === 'long'
      if (forceLongBreak) {
        console.log(
          'long every',
          getUserSettingsStore().get('breaks').long.every
        )
        return getUserSettingsStore().get('breaks').long.every
      } else {
        return 1
      }
    }
  }
  return oldIndex
}

export const setNewBreak = (options: NewBreakOptions) => {
  closeAllWindows()

  const nextBreakIn = options?.forceNextBreakIn || getEveryFromDB()

  breakIndex.value = getNewBreakIndex(breakIndex.value, options)

  breakId.value++
  const keyBreakIndex = breakId.value

  if (breakSchedule) breakSchedule.cancel()

  console.log('setNewBreak', 'breakIndex.value', breakIndex.value)

  lastSchedulerJobDate.value = new Date().toISOString()
  lastSchedulerJobLength.value = nextBreakIn
  console.log(
    'nextBreakIn',
    nextBreakIn,
    'lastSchedulerJobLength.value',
    lastSchedulerJobLength.value
  )
  if (nextBreakIn > 0) {
    const nextBreak = calculateNextBreak(nextBreakIn)

    breakSchedule = scheduleJob(nextBreak, () => {
      if (keyBreakIndex === breakId.value) {
        closeAllWindows()
        createWindowIndex()
      }
    })
  } else {
    createWindowIndex()
  }
}

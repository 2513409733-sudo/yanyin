const parseDate = (str) => new Date(str + 'T00:00:00')
const todayStr = () => new Date().toISOString().slice(0, 10)

// Sorted logs for one user (oldest first)
export const logsFor = (allLogs, from) =>
  allLogs.filter(l => l.from === from).sort((a, b) => a.startDate.localeCompare(b.startDate))

// Average days between consecutive startDates. Null if fewer than 2 completed logs.
export const calcAvgCycle = (logs) => {
  const completed = logs.filter(l => l.endDate !== null)
  if (completed.length < 2) return null
  let total = 0
  for (let i = 1; i < completed.length; i++) {
    total += (parseDate(completed[i].startDate) - parseDate(completed[i - 1].startDate)) / 86400000
  }
  return Math.round(total / (completed.length - 1))
}

// Predicted next start date as 'YYYY-MM-DD', or null
export const predictNextPeriod = (logs, avgCycle) => {
  if (!avgCycle) return null
  const last = logs[logs.length - 1]
  if (!last) return null
  const next = new Date(parseDate(last.startDate).getTime() + avgCycle * 86400000)
  return next.toISOString().slice(0, 10)
}

// Is the user currently in a period?
export const isCurrentlyInPeriod = (logs) => {
  if (!logs.length) return false
  const latest = logs[logs.length - 1]
  return latest.endDate === null && latest.startDate <= todayStr()
}

// Day number of current period (1-based), or null
export const currentPeriodDay = (logs) => {
  if (!isCurrentlyInPeriod(logs)) return null
  const latest = logs[logs.length - 1]
  return Math.floor((parseDate(todayStr()) - parseDate(latest.startDate)) / 86400000) + 1
}

// Days until the next predicted period, or null
export const daysUntilNext = (nextDate) => {
  if (!nextDate) return null
  const diff = Math.ceil((parseDate(nextDate) - parseDate(todayStr())) / 86400000)
  return diff >= 0 ? diff : null
}

// Set of 'YYYY-MM-DD' strings within any log's period range for the given year/month
export const getPeriodDaysInMonth = (logs, year, month) => {
  const result = new Set()
  const firstDay = new Date(year, month - 1, 1)
  const lastDay  = new Date(year, month, 0)
  for (const log of logs) {
    const start = parseDate(log.startDate)
    const end   = log.endDate ? parseDate(log.endDate) : parseDate(todayStr())
    let cur = new Date(Math.max(start.getTime(), firstDay.getTime()))
    const stop = new Date(Math.min(end.getTime(), lastDay.getTime()))
    while (cur <= stop) {
      result.add(cur.toISOString().slice(0, 10))
      cur.setDate(cur.getDate() + 1)
    }
  }
  return result
}

// Set of predicted period days (5-day estimate) for the given year/month
export const getPredictedDaysInMonth = (nextDate, year, month) => {
  if (!nextDate) return new Set()
  const result = new Set()
  for (let i = 0; i < 5; i++) {
    const d = new Date(parseDate(nextDate).getTime() + i * 86400000)
    if (d.getFullYear() === year && d.getMonth() + 1 === month) {
      result.add(d.toISOString().slice(0, 10))
    }
  }
  return result
}

// Duration string for a log
export const logDuration = (log) => {
  if (!log.endDate) return '进行中'
  const days = Math.floor((parseDate(log.endDate) - parseDate(log.startDate)) / 86400000) + 1
  return `${days} 天`
}

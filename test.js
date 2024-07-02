const dayjs = require('dayjs')
// function getDayStringsBetweenDates({ initialDate, endDate, format }) {
//   let strings = []
//   let iteratingDate = dayjs(initialDate)
//   const goalDate = dayjs(endDate)

//   while (iteratingDate.isBefore(goalDate) || iteratingDate.isSame(goalDate, 'day')) {
//     const dayStr = iteratingDate.format(format || 'DD/MM')
//     strings.push(dayStr)
//     iteratingDate = iteratingDate.add(1, 'day')
//   }

//   return strings
// }

// const strings = getDayStringsBetweenDates({ initialDate: '2024-06-21T17:00:35.647Z', endDate: '2024-08-21T17:00:35.647Z' })
// console.log(strings)

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1)
}
function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0)
}

const referenceDate = '2024-07-15T03:00:00.000Z'

function getPeriodDateParamsByReferenceDate({ reference, type = 'month', resetStart, resetEnd }) {
  if (type == 'month') {
    var start = dayjs(reference).startOf('month')
    var end = dayjs(reference).endOf('month')
    if (resetStart) start = start.subtract(3, 'hour')
    if (resetEnd) end = end.startOf('day').subtract(3, 'hour')
    return { start: start.toDate(), end: end.toDate() }
  }
  if (type == 'year') {
    var start = dayjs(reference).startOf('year')
    var end = dayjs(reference).endOf('year')
    if (resetStart) start = start.subtract(3, 'hour')
    if (resetEnd) end = end.startOf('day').subtract(3, 'hour')
    return { start: start.toDate(), end: end.toDate() }
  }
}

console.log(getPeriodDateParamsByReferenceDate({ reference: referenceDate, type: 'year', resetStart: true }))

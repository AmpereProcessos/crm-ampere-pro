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

const referenceDate = '2024-07-15T03:00:00.000Z'
const hourDiff = dayjs(referenceDate).diff(dayjs(null), 'hour')
console.log(hourDiff || 0)

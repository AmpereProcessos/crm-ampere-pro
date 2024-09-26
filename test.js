const dayjs = require('dayjs')

const splitted = '09/2024'.split('/')
const month = splitted[0]
const day = '01'
const year = splitted[1]

const date = [month, day, year].join('/')
console.log(date)
console.log(dayjs('12/31/2024').endOf('year').subtract(3, 'hour').toISOString())
// console.log(dayjs(date).startOf('month').subtract(3, 'hours').toISOString())
// console.log(dayjs(date).endOf('month').subtract(3, 'hours').toISOString())

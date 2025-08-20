const dayjs = require('dayjs')

const dateAsDayjs = dayjs("0002-05-12T12:00")
console.log({
    year: dateAsDayjs.year(),
    month: dateAsDayjs.month(),
    day: dateAsDayjs.date(),
    hour: dateAsDayjs.hour(),
    minute: dateAsDayjs.minute(),
})

const secondDateAsDayjs = dayjs("0002-06-18T12:00")
console.log({
    asDate: new Date('0002-06-18T12:00'),
    asISO: secondDateAsDayjs.toISOString(),
    year: secondDateAsDayjs.year(),
    month: secondDateAsDayjs.month(),
    day: secondDateAsDayjs.date(),
    hour: secondDateAsDayjs.hour(),
    minute: secondDateAsDayjs.minute(),
})

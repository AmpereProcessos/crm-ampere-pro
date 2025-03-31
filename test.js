const { env } = require('process')

const credentials = `${env.CONTA_AZUL_CLIENT_ID}:${env.CONTA_AZUL_CLIENT_SECRET}`
const base64Credentials = btoa(credentials)

console.log('testing')

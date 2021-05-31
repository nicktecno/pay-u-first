require('dotenv-safe/config')

const { exec } = require('child_process')

process.env.DB_URL = `${process.env.DB_URL}_testdb?schema=test_schema`

//comando para rodar linha de comando dentro do node exec
exec('yarn db:migrate')

module.exports = {}

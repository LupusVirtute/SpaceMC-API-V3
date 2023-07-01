import express from 'express'
import path from 'path'
import RouteScanner from './routeScanner'
import Log4js from 'log4js'
import dotenv from 'dotenv'
import ServiceScanner from './serviceScanner'

dotenv.config()


Log4js.configure({
	appenders: { 
		transactions: { type: 'file', filename: 'logs/transactions.log' },
		votes: { type: 'file', filename: 'logs/votes.log' },
		error: { type: 'file', filename: 'logs/error.log' }
	},
	categories: {
		default: { appenders: ['error'], level: 'error'},
		transactions: { appenders: ['transactions'], level: 'info' }, 
		votes: { appenders: ['votes'], level: 'info' } 
	}
})

const app = express()

app.use(express.json())


const PORT = process.env.PORT || 8000

const routesPath = path.join(__dirname, 'routes')


const scanner = new RouteScanner(app)
scanner.dirScan(routesPath)

const servicePath = path.join(__dirname, 'services')

const serviceScanner = new ServiceScanner()
serviceScanner.dirScan(servicePath)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})


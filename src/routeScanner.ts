// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck Because yes
import fs from 'fs'
import path from 'path'
import { Express, Request, Response } from 'express'
import chalk from 'chalk'

interface RouteStructure {
    post?: any
    get?: any
    delete?: any
    put?: any
}
chalk.level = 1
const routesPath = path.join(__dirname, 'routes')

const allowedMethods = ['post', 'get', 'delete', 'put']

export default class RouteScanner {
 
    // eslint-disable-next-line no-unused-vars, no-useless-constructor, no-empty-function
    constructor(private app: Express) {}
    
    async fileScanner(file: string, dirPath: string) {
        const filePath = path.join(dirPath, file)
        if(RouteScanner.isDir(filePath)) {
            this.dirScan(filePath)
            return
        }
        const route = await import(filePath)
        this.assignObject(route, filePath)
    }

    private assignObject(route: RouteStructure, filePath: string) {
        const replaceParam = /\[(.*)\]/g
        
        const routePath = filePath.split(routesPath)[1].split('.ts')[0].replaceAll('\\', '/').replaceAll(replaceParam, ':$1')
        
        const defaultFunction = (req: Request, res: Response) => { 
            res.status(404).send('Not found')
        }
        // eslint-disable-next-line no-restricted-syntax
        for(const key of Object.keys(route)) {
            // eslint-disable-next-line no-continue
            if(!allowedMethods.includes(key)) continue;
            
			this.app[key](routePath, route[key] || defaultFunction)

            console.info(`Registered route: ${chalk.yellow(routePath)}`)
            console.log(`Method: ${chalk.blue(key)}`)
        }
    }

    static isDir(filePath: string): boolean {
        return fs.statSync(filePath).isDirectory()
    }

    dirScan(dirPath: string) {
        fs.readdirSync(dirPath).forEach(file => this.fileScanner(file, dirPath))
    } 
    
}
/* eslint-disable @typescript-eslint/no-empty-function */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck Because yes
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

interface ServiceStructure {
    service?: any
	serviceRepeatTime?: number
}
chalk.level = 1


export default class ServiceScanner {
    
    async fileScanner(file: string, dirPath: string) {
        const filePath = path.join(dirPath, file)
        if(ServiceScanner.isDir(filePath)) {
            this.dirScan(filePath)
            return
        }
        const service = await import(filePath)
        this.startService(service, filePath)
    }

    private startService(service: ServiceStructure, filePath: string) {
		const defaultService = () => {
			console.log("Service: " + filePath + " is not defined")
		}
		
		setInterval(service.service || defaultService, service.serviceRepeatTime || 500)
    }

    static isDir(filePath: string): boolean {
        return fs.statSync(filePath).isDirectory()
    }

    dirScan(dirPath: string) {
        fs.readdirSync(dirPath).forEach(file => this.fileScanner(file, dirPath))
    } 
    
}
import { sha256 } from "js-sha256";
import { prisma } from "../utils/prisma";
import { getUserMetaFromLogin, getUserSessionFromLogin, getUserSessionId } from "../utils";
import { Transactable } from ".";
import TransactionResponse from "./TransactionResponse";
import { getLogger } from 'log4js'

interface UserMeta {
    id: number
    nick: string
    uid: string
    time: number
    kills: number
    deaths: number
    ore: number
    joinTime: number
    invited: boolean
    inviteAmount: number
    invitedBy: string
    votes: number
    points: number
    votemodif: number
}

class User {
    private sID: string;
    private userName = '';
    private userMeta?: UserMeta = undefined;

    constructor(sID?: string) {
        if(sID) {
            this.sID = sID;
            return
        }
        this.sID = sha256(Math.random().toString())
    }

    async login(login: string, password: string): Promise<string> {

        this.userName = login

        const authmeUser = await prisma.authme.findFirst({
            where: {
                username: login
            }
        })
        
        if (authmeUser == null) {
            return ''
        }

        const array = authmeUser.password.split('$')
    
        const salt = array[2]
    
        const hash = sha256(sha256(password) + salt)
    
        const hashedPassword = array[3]
    
        if (hashedPassword === hash) {
            const uid = await getUserSessionId(login)

            if (uid) {
                return (await this.updateSession(uid, hash)).session
            } else {
                return (await this.createSession(hash)).session
            }
        }
        return 'ERROR'
    }

    async getUserName(): Promise<string> {
        const meta = await this.getUserMeta()
        return meta?.nick ?? ''
    }

	async isVerified(): Promise<boolean> {
		if(!this.userName)
			throw new Error("userName not defined")

		const sID = await getUserSessionFromLogin(this.userName)
		return sID === this.sID
	}

    async makeTransaction(amount: number, serverPath: string, transactable: Transactable): Promise<TransactionResponse> {
		if(!this.userName)
			throw new Error("userName not defined")
	
		const isVerified = await this.isVerified()

		if(!isVerified)
			throw new Error("User not verified")
		if(amount <= 0)
			amount = 1

		
		const log = getLogger('transactions')
		
		log.info('')
		log.info('')
		log.info('')
		log.info('Date: ', Intl.DateTimeFormat('en-US').format(new Date()))

		log.info("Initializing transaction for: ".padEnd(30), this.userName)

		log.info("ServerPath : ".padStart(10), serverPath)
		log.info("Amount : ".padStart(10), amount)

		log.info("Transactionable : ".padStart(10), transactable.packageName)

        const { points } = await this.getUserMeta() ?? { points: null }

		log.info("Current amount of points : ".padStart(10), points)
        
		if (!points)
            return TransactionResponse.NO_POINTS;

		const totalCost = amount * transactable.pointCost

		log.info("Total cost : " + totalCost)
		
		if (totalCost > points)
			return TransactionResponse.NO_POINTS;

		const statusAfterTransaction = points - totalCost

		log.info("Status after transaction: ".padStart(10), statusAfterTransaction)

		this.takePoints(totalCost)
		
		log.info("Succesfully took points from user starting command...")

		await transactable.execute(this.userName, serverPath, amount)

		log.info("Succesfully executed command")

		return TransactionResponse.SUCCESS;
	}

    async getUserMeta(force = false): Promise<UserMeta | undefined> {
        if(this.userMeta && !force)
            return this.userMeta

        const meta = await getUserMetaFromLogin(this.userName) as UserMeta | undefined
        this.userMeta = meta as UserMeta
        return meta ?? undefined
    }

	async getPointModifier() {
        this.getUserMeta()
        return this.userMeta?.votemodif ?? 1.0
    }

    async addModifier(increaseBy: number) {
        return await prisma.players.update({
            where: {
                nick: this.userName
            },
            data: {
                votemodif: {
					increment: increaseBy
				}
            }
        })
    }

	async takeModifier(decreaseBy: number) {
		return await prisma.players.update({
			where: {
				nick: this.userName
			},
			data: {
				votemodif: {
					decrement: decreaseBy
				}
			}
		})
	}

	async addPoints(amount: number) {
		return await prisma.players.update({
			where: {
				nick: this.userName
			},
			data: {
				points: {
					increment: amount
				}
			}
		})
	}

	private async takePoints(amount: number) {
		return await prisma.players.update({
			where: {
				nick: this.userName,
			},
			data: {
				points: {
					decrement: amount
				}
			}
		})
	}

    private async createSession(hash: string) {
        const { userName } = this

        this.sID = sha256(Math.random().toString() + hash)

        return await prisma.sessions.create({
            data: {
                login: userName,
                session: this.sID
            }
        })
    }
    
    private async updateSession(uid: number, hash: string) {
        this.sID = sha256(Math.random().toString() + hash)

        return await prisma.sessions.update({
            where: {
                id: uid
            },
            data: {
                session: this.sID
            }
        })
    }
 
}

export default User;

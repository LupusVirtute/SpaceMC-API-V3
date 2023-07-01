import { prisma } from "./prisma"

const getUserSessionFromLogin = async (login: string) => {
    const result = await prisma.sessions.findFirst({
		where: {
			login: login
		}
	})
    return result?.session ?? ''
}
const getUserSessionId = async (login: string) => (
    (await prisma.sessions.findFirst({
        where: {
            login: login
        }
    }))?.id ?? ''
)

const getUserMetaFromLogin = async (login: string) => {
    return await prisma.players.findFirst({
        where: {
            nick: login
        }
    })
}

export {
    getUserMetaFromLogin,
    getUserSessionFromLogin,
    getUserSessionId
}
import { Request, Response } from 'express'
import { getUserMetaFromLogin } from '../../utils'
import _ from 'lodash'

const publicPlayerFields = ['nick','time','kills','deaths','ore','inviteAmount','votes']

export const get = async (req: Request, res: Response) => {
    const { user } = req.params
	
	const metaData = await getUserMetaFromLogin(user)
	res.send(_.pick(metaData,publicPlayerFields))
}
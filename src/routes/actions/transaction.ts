import { Request, Response} from 'express'
import { Config, User } from '../../common';

export const post = async (request: Request, response: Response) => {
	if (request.headers['content-type'] != 'application/json') {
		response.sendStatus(415)
		return;
	}
	
	const { transactablePackage, serverPath, amount } = request.body
	const { sid } = request.cookies

	const user = new User(sid)
	if(!user.isVerified()) {
		response.sendStatus(401)
		return;
	}

	for(const server of Config.servers) {
		if(server.path == serverPath) {
			for(const transactable of server.transactables) {
				if(transactable.packageName == transactablePackage) {
					transactable.execute(await user.getUserName(), serverPath, amount)
					break;
				}
			}
			break;
		}
	}
}
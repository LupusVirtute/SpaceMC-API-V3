import { Transactable } from ".";

class Server {
	constructor(readonly path: string, readonly transactables: Transactable[]) {
	
	}

	public async execute(user: string, amount: number, transactable: Transactable): Promise<void> {
		transactable.execute(user, this.path, amount)
	}
}

export default Server
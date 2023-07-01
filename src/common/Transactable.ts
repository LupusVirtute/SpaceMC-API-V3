import { Rcon } from "rcon-client"
import { getRconClient } from '../utils/server';

class Transactable {
    constructor(
        readonly pointCost: number,
        readonly command: string,
        readonly packageName: string,
        readonly description: string
        ) {
    }

    public async execute(user: string, serverPath: string, amount: number): Promise<void> {
        const userParsed = user.replace(' ', '')

		const client = await getRconClient();

		const finalCommand = this.command
		.replaceAll('%user%', userParsed)
		.replaceAll('%amount%', amount.toString())
		.replaceAll("%serverPath%",serverPath)

		await client.send(finalCommand)

		await client.end()
    }
	
	public async executeBunch(client: Rcon, user: string, serverPath: string, amount: number): Promise<void> {
        const userParsed = user.replace(' ', '')

		const finalCommand = this.command
		.replaceAll('%user%', userParsed)
		.replaceAll('%amount%', amount.toString())
		.replaceAll("%serverPath%",serverPath)

		await client.send(finalCommand)
	}

}

export default Transactable;

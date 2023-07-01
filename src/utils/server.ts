import { Rcon } from "rcon-client";
import { Config } from '../common'

export async function getRconClient() {
	return await Rcon.connect({
		host: Config.rcon.host,
		port: Number.parseInt(Config.rcon.port),
		password: Config.rcon.password
	})
}
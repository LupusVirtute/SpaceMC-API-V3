import Server from "./Server";
import Transactable from "./Transactable";

const transactables = [
	new Transactable(10, "case give infinity %player%", "Infinity", ""),
	new Transactable(10, "case give void %player%", "Void", ""),
	new Transactable(10, "case give cursed %player%", "Cursed", "")
]

export default {
	rcon: {
		host: process.env.RCON_HOST ?? 'localhost',
		password: process.env.RCON_PASSWORD ?? '',
		port: process.env.RCON_PORT ?? '25575',
	},
	servers: [
		new Server("survival", [
			...transactables
		]),
		new Server("skyblock", [
			...transactables
		])
	] as Server[],
}
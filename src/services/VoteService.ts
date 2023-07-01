import fetch from 'node-fetch'
import _ from 'lodash'
import { getRconClient } from '../utils/server';
import { Rcon } from 'rcon-client/lib';
import { getLogger } from 'log4js';
import { Response } from 'node-fetch'
import { User } from '../common';

let initial = true;

let cachedLast: any = {}

interface Vote {
	nickname: string
	createdAt: string
}

const rank = 'gold+'
const rankPrefix = '&eGold&a+'

let abortFurtherConnections = new Date('2069');

export const service = async () => {
	if(abortFurtherConnections > new Date()) return;
	const log = getLogger('votes')

	const votingAPIEndpoint = process.env.VOTE_ENDPOINTS?.split(' ') ?? ['http://localhost:8000']

	const votes: Vote[] = []
	
	const requests: Promise<Response>[] = []
	
	for(const endpoint of votingAPIEndpoint) {
		requests.push(fetch(endpoint))
	}
	Promise.all(requests).then(final => {
		final.push
	})

	
	if(initial) {
		initial = false;
		cachedLast = votes;
		return;
	}

	const diff = _.differenceWith(cachedLast, votes, _.isEqual)
	
	if(diff.length === 0) return;

	let rconClient = null;
	
	try {
		rconClient = await getRconClient()
	}
	catch(ex: any) {
		if(ex.code == "ECONNREFUSED") {
			console.log("VoteService: Connection refused logging difference...")
			log.info("Tried giving rewards but connection was refused for: ")
			diff.forEach(v => log.info(v))
			abortFurtherConnections = new Date(Date.now() + 1000 * 60);

		}
		return;

	}

	for(const vote of diff) {
		await awardVote(rconClient, vote.nickname)
	}

	await rconClient.end()
	
	cachedLast = votes;

}

async function awardVote(rconClient: Rcon, nickname: string) {
	await rconClient.send(`lp user ${nickname} permission settemp group.${rank} true 1d accumulate`)

	await rconClient.send(
	`bc &b ` +
	'&c&l---------------»   &b&lSPACEMC &c&l«----------------\n&5\n'+
	`           &b${nickname} &7odebral range ${rankPrefix}&7 za glosowanie!\n&5\n`+
	'&c&l----------------»   &b&lSPACEMC &c&l«----------------\n'
	)

	const user = new User(nickname)

	const pointModifier = await user.getPointModifier()
	
	user.addPoints(10 * pointModifier)
}
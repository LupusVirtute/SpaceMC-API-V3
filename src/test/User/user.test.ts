import { Transactable } from "../../common";
import User from "../../common/User"
import testCfg from '../testCfg';

const { password, userName } = testCfg;

test('Login should return auth key', async () => {
    const user = new User()
    const sha256 = await user.login(userName, password)
    expect(sha256 !== 'ERROR').toBeTruthy()
    expect(sha256.length).toBe(64)
})

test('Login shouldn\'t return proper auth key', async () => {
    const user = new User()
    const sha256 = await user.login(userName, password+'wrong password')
    expect(sha256).toBe('ERROR')
    expect(sha256.length != 64).toBeTruthy()
})

test('Check user name is correct', async () => {
    const user = new User()
    await user.login(userName, password);
    const name = await user.getUserName()
    expect(name.toLowerCase()).toBe(userName.toLowerCase())
})

test('Check if user can access it\'s metadata whilst not being logged in', async () => {
    const user = new User()
    const meta = await user.getUserMeta()
    expect(meta).toBeUndefined()
})

test('Check if user can access metadata whilst being logged in', async () => {
    const user = new User()
    await user.login(userName, password)
    const meta = await user.getUserMeta()
    expect(meta).toBeDefined()
})


// Local server has to be online for this test to work

test('Check if user points go away', async () => {
	const user = new User()
	
	
	await user.login(userName, password)
	await user.addPoints(10)
	
	const userMetaBefore = await user.getUserMeta(true)
	
	// TS has problems with this shit not being checked
	if(!userMetaBefore) {
		expect(userMetaBefore).toBeDefined()
		return;
	}
	
	
	const transaction = new Transactable(10,"eco give %user% %amount%", "test", "test")
	await user.makeTransaction(1, '', transaction)
	
	const userMetaAfter = await user.getUserMeta(true)
	
	if(!userMetaAfter){
		expect(userMetaAfter).toBeDefined()
		return;
	}
	expect(userMetaBefore.points).toBe(userMetaAfter.points + 10)
})
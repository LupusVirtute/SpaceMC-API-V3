import User from "../../common/User"
import testCfg from '../testCfg';
import {
    getUserMetaFromLogin,
    getUserSessionFromLogin
} from '../../utils/userUtil'

const { password, userName } = testCfg;


test('Check whether user login name is correct from sID', async () => {
    const user = new User()
    const sID = await user.login(userName, password)
    const sIDFromName = await getUserSessionFromLogin(userName)
    expect(sID).toBe(sIDFromName)
})

test('Check whether user login name isn\'t correct from sID', async () => {
    const user = new User()
    const sID = await user.login(userName, password)
    const sIDFromName = await getUserSessionFromLogin(userName+' wrong')
    expect(sID !== sIDFromName).toBeTruthy()
})

test('Check user meta being downloaded for correct user name', async () => {
    const metaData = await getUserMetaFromLogin(userName)
    expect(metaData).toBeDefined()
})

test('Check user meta data being downloaded for incorrect user name', async () => {
    const metaData = await getUserMetaFromLogin(userName + ' wrong nickName')
    expect(metaData).toBeNull()
})

test('Check metadata nick to be correct', async () => {
    const metaData = await getUserMetaFromLogin(userName)
    expect(metaData?.nick).toBe(userName)
})
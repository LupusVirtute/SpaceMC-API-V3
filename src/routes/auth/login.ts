import { Request, Response} from 'express'
import { verify } from 'hcaptcha'
import User from '../../common/User'

const secret = process.env.HCAPTCHA_SECRET

export const get = async (req: Request, res: Response) => {
    if (secret == null || secret === undefined)
        return res.status(500).send('Internal server error')
    
    // Get Request Data
    const { username, password, captchaKey } = req.body
    
    const data = await verify(secret, captchaKey)
    
    if (!data.success) {
        return res.status(401).send('BAD_CAPTCHA_KEY')
    }
    // Check if username and password is valid
    if (!username && !password) {
        // Return invalid if username or password is invalid
        return res.status(401).send('BAD_PASS_OR_NICK')
    }
	const user = new User();
    const session = await user.login(username, password)

    if (session == null) return res.send(418)
    
    if (session === 'ERROR') {
        return res.status(401).send('BAD_PASS_OR_NICK')
    }
    
    const jsonResponse = await JSON.stringify(session)
    
    // Return response
    return res.status(200).json(jsonResponse)
}

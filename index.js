const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios')
const { auth } = require('express-oauth2-jwt-bearer');
const port = 3000;


const checkJwt = auth({
    audience: 'https://dev-q5lvxar6msc8ug4f.us.auth0.com/api/v2/',
    issuerBaseURL: `https://dev-q5lvxar6msc8ug4f.us.auth0.com/`,
  });


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const AUTH0_API = 'https://dev-q5lvxar6msc8ug4f.us.auth0.com'
const CLIENT_ID = 'r8UZJVdlrWWw1EDH5Pgk7eAxrMmoRrus'
const CLIENT_SECRET = 'HFs4qWK4_Ul2kaAalEY2RGu5JACUfPs580q-2lCVKXNDsw6lLEPycpQEJ9iqcYyZ'
const AUDIENCE = 'https://dev-q5lvxar6msc8ug4f.us.auth0.com/api/v2/'
const PASSWORD_GRANT_TYPE = 'password'
const TOKEN_ENDPOINT = 'oauth/token'

const USERINFO_ENDPOINT = 'userinfo'



const getUserDataMiddleware = async (req, res, next) => {
    const token = req.auth.token
    try {
        const userinfo = await axios.get(`${AUTH0_API}/${USERINFO_ENDPOINT}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        req.user = {
            username: userinfo.data.nickname
        }
        next()
    } catch (error) {
        next()
    }
    next()
}

app.get('/', (req, res) => {
    return res.sendFile(path.join(__dirname+'/index.html'));
})

app.get('/get-user', checkJwt, getUserDataMiddleware, (req, res) => {
    return res.json({
        username: req?.user?.username ?? 'Unknown user',
        logout: 'http://localhost:3000/logout'
    })
})

app.get('/logout', (req, res) => {
    res.redirect('/');
});


app.post('/api/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        const respond = await axios.post(`${AUTH0_API}/${TOKEN_ENDPOINT}`, {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            audience: AUDIENCE,
            grant_type: PASSWORD_GRANT_TYPE,
            username: login,
            password: password,
            scope: "offline_access openid"
        })
        return res.status(200).send({ token: respond.data.access_token })
    } catch (error) {
        res.status(401).send(error.message);
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

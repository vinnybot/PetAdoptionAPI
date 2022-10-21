const jwt = require('jsonwebtoken');
const config = require('config');
const debug = require('debug')('app:middleware:auth');

const auth = () => {
    return (req, res, next) => {
        try {
            const authCookie = req.cookies.authToken;
            if (authCookie) {
                const authSecret = config.get('auth.secret');
                debug(authCookie, authSecret);
                const authPayload = jwt.verify(authCookie, authSecret);
                req.auth = authPayload; 
        }
        } catch (err) {
            debug(err);
        }

        next();
    };
};

module.exports = auth;
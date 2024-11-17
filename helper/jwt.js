const { expressjwt: jwt } = require("express-jwt");

function authJwt() {
    const secret = process.env.JSON_WEB_TOKEN_SECRET_KEY;
    return jwt({
        secret: secret,
        algorithms: ["HS256"],
        requestProperty: 'auth', // Optional: where to attach the token data (e.g., req.auth)
    }).unless({
        path: [
            // Specify public routes that don’t need authentication here, e.g.,
            { url: /\/public\/.*/, methods: ['GET', 'OPTIONS'] },
            '/api/user/signup', // public route for login
            '/api/user/signin', // public route for registration
        ]
    });
}

module.exports = authJwt;

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'e91f696e93ce5cb5a43208aa0368aae3f711f1a03a66bb052290a22df6fd266fz';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    let token = authHeader?.split(' ')[1];
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = verifyToken;
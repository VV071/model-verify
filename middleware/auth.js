const admin = require('../config/firebaseAdmin');
const expressasyncHandler = require('express-async-handler');

const auth = expressasyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401);
        throw new Error('No token provided');
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        res.status(401);
        throw new Error('Invalid token');
    }
});

module.exports = auth;
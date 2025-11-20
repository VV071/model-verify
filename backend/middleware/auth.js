const admin = require('../config/firebaseAdmin');
const expressasyncHandler = require('express-async-handler');

const auth = expressasyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Auth middleware: missing or invalid Authorization header:', authHeader);
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        return next();
    } catch (error) {
        console.warn('Auth middleware: token verification failed', error && error.message);
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = auth;
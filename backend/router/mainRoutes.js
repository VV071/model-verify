const express = require('express');
const Router = express.Router();
const {register , verify } = require('../controllers/mainController');
const auth = require('../middleware/authMiddleware');

Router.post('/register', auth ,register);
Router.get('/verify',auth,verify);

module.exports = Router;
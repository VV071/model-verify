const express = require('express');
const Router = express.Router();
const {register , verify } = require('../controller/mainController');
const auth = require('../middleware/auth');

Router.post('/register', auth ,register);
Router.get('/verify',auth,verify);

module.exports = Router;
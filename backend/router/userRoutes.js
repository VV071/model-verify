const express = require('express');
const Router = express.Router();
const {sign_in,sign_up, profile} = require('../controller/userController');
const auth = require('../middleware/auth');

Router.post('/sign_in', sign_in);
Router.post('/sign_up', sign_up);
Router.get('/profile', auth, profile);

module.exports = Router;
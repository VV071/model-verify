const express = require('express');
const Router = express.Router();
const {sign_in,sign_up} = require('../controller/userController');

Router.post('/sign_in', sign_in);
Router.post('/sign_up', sign_up);

module.exports = Router;
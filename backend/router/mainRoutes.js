const express = require('express');
const Router = express.Router();
const {register , verify, delete_palm } = require('../controller/mainController');
const auth = require('../middleware/auth');

Router.post('/register', auth ,register);
Router.post('/verify', auth, verify);
Router.delete('/delete_palm', auth, delete_palm);

module.exports = Router;
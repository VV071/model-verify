const express = require('express');
const Router = express.Router();
const {register , verify, deletePalm } = require('../controller/mainController');
const auth = require('../middleware/auth');

Router.post('/register', auth ,register);
// verification expects palm data in the request body, use POST
Router.post('/verify', auth, verify);
// allow deleting stored palm data for the authenticated user
Router.delete('/register', auth, deletePalm);

module.exports = Router;
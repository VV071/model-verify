const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const onnx = require('onnxruntime-node');
const userRoutes = require('./router/userRoutes');
const mainRoutes = require('./router/mainRoutes');
require('dotenv').config();

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type  ', 'Authorization'],
    credentials: true
}));

app.use('/user', userRoutes);
app.use('/main', mainRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
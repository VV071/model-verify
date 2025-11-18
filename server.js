const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const onnx = require('onnxruntime-node');
const userRoutes = require('./routes/userRoutes');
const mainRoutes = require('./routes/mainRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(express.json());
app.use(cors({
    origin: 'localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type  ', 'Authorization'],
    credentials: true
}));

app.use('/user', userRoutes);
app.use('/', mainRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
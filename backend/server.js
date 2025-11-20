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
// Allow local frontend origins during development
app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin (mobile apps, curl, postman)
        if(!origin) return callback(null, true);
        const allowed = ['http://localhost:3000','http://localhost:3001'];
        if(allowed.indexOf(origin) !== -1){
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use('/user', userRoutes);
app.use('/main', mainRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
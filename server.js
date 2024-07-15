const express = require("express")
const app = express();
require('dotenv').config();
const db = require('./db');
const bodyParser = require('body-parser');
app.use(bodyParser.json()); //req.body

//import the router files 
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const User = require("./Models/user");

const port = process.env.PORT || 4000;

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(port, () => {
    console.log("Server is listening on port 3000")
});
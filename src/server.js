import express from "express";
import configViewEngine from "./config/viewEngine";
import initWebRoute from './route/web';
import initAPIRoute from './route/api';
// import connection from './config/connectDB';

require('dotenv').config();
var morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3031;

// app.use((req, res, next) => {
//     //check => return res.send
//     console.log('>>> run into my middleware');
//     next();
// })

// app.use(morgan('combined'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//set up view engine
configViewEngine(app);

//init web rout
initWebRoute(app);

//init API route
initAPIRoute(app);

//handle 404 not found
app.use((req, res) => {
    return res.render('404.ejs');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
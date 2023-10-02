// Database connection url 
const connection = require('./Components/Connection/DB_Connections');
const bodyParser=require('body-parser')
// Database connection function 
connection();

const express = require('express');
const cors = require('cors')
const app = express();

// Middleware to send post request
// app.use(express.json())
app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())


app.get('/', (req, res) => {
    try{
    return res.status(200).json({"Message":"Please route to correct page.Have a Good Day"})
    }
    catch(err){
        return res.json(err)
    }
    // console.log(req.socket.remoteAddress)
})
// Available routes 
app.use('/home/faculty', require('./Components/Routes/User'));
app.use('/home/faculty/book', require('./Components/Routes/Book'));
app.use('/home/faculty/bookChapter', require('./Components/Routes/BookChapter'));

app.use('/home/faculty/journal', require('./Components/Routes/Journal'));
app.use('/home/faculty/conference', require('./Components/Routes/Conference'));






app.listen(3001, () => {
    console.log('Listening at Localhost:3001')
})
module.exports=app;
// const app = require('express')();
// const { v4 } = require('uuid');

// app.get('/api', (req, res) => {
//   const path = `/api/item/${v4()}`;
//   res.setHeader('Content-Type', 'text/html');
//   res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
//   res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
// });

// app.get('/api/item/:slug', (req, res) => {
//   const { slug } = req.params;
//   res.end(`Item: ${slug}`);
// });

// module.exports = app;

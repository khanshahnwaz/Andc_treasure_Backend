// Database connection url 
const connection = require('./Components/Connection/DB_Connections');

// Database connection function 
connection();

const express = require('express');
const cors = require('cors')
const app = express();

// Middleware to send post request
app.use(express.json())
app.use(cors())

// Available routes 
app.use('/home/faculty', require('./Components/Routes/User'));
app.use('/home/faculty/book', require('./Components/Routes/Book'));
app.use('/home/faculty/bookChapter', require('./Components/Routes/BookChapter'));

app.use('/home/faculty/journal', require('./Components/Routes/Journal'));
app.use('/home/faculty/conference', require('./Components/Routes/Conference'));


app.get('/', (req, res) => {
    try{
    return res.status(200).json({"Message":"Please route to correct page.Have a Good Day"})
    }
    catch(err){
        return res.json(err)
    }
    // console.log(req.socket.remoteAddress)
})



app.listen(3001, () => {
    console.log('Listening at Localhost:3001')
})


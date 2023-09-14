const mongoose = require('mongoose');
const connection =  () => {
    // connect to local database 
    const connect=mongoose.connect("mongodb://127.0.0.1:27017/andc_treasure")
    // const connect=mongoose.connect("mongodb+srv://khanshahnwaz:Anonymous786@andctreasure.e5tjaqw.mongodb.net/andctreasure?retryWrites=true&w=majority")
    if (connect) {
        console.log("Connection successfull.")
    } else {
        console.log('Failed to establish connection.')
    }
}
module.exports=connection;
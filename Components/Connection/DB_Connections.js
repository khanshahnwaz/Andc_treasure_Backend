const mongoose = require('mongoose');
const connection =  () => {
    // const connect =  mongoose.connect("mongodb+srv://khanshahnwaz:Anonymous786@andctreasure.e5tjaqw.mongodb.net/?retryWrites=true&w=majority")
    const connect=mongoose.connect("mongodb+srv://khanshahnwaz:Anonymous786@andctreasure.e5tjaqw.mongodb.net/andctreasure?retryWrites=true&w=majority")
    if (connect) {
        console.log("Connection successfull.")
    } else {
        console.log('Failed to establish connection.')
    }
}
module.exports=connection;
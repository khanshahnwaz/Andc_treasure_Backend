const mongoose= require('mongoose');

const User= new mongoose.Schema({
    Name:{
        type:String
    },
    Email:{
        type:String,
        unique:true
    },
    Phone:{
        type:String,
    },
    Department:{
        type:String
    },
    Designation:{
        type:String
    },
    Password:{
        type:String
    }
})
const user= mongoose.model('faculty',User);
module.exports=user;
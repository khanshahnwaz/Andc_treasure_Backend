const mongoose= require('mongoose');

const BookPublications=new mongoose.Schema({
    PID:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'publicationType'
    },
    FID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'faculty'
    },
    Title:{
        type:String
    },
    Editor:{
        type:String
    },
    Area:{
        type:String
    },
    CoAuthors:Array,
    Edition:String
})
const bookPublication=mongoose.model('bookPublication',BookPublications);
module.exports=bookPublication;
const mongoose= require('mongoose');

const ConferencePublications=new mongoose.Schema({
    FID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'faculty'
    },
    PID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'publicationType'  
    },
    PaperTitle:{
        type:String
    },
    CorrespondingAuthor:{
        type:String
    },
    FirstAuthor:String,
    PaperPresented:String,
    National:String,
    Place:String,
    CoAuthors:Array
  
})
const conferencePublication=mongoose.model('conferencePublication',ConferencePublications);
module.exports=conferencePublication;
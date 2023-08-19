const mongoose= require('mongoose');

const JournalPublications=new mongoose.Schema({
    FID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'faculty'
    },
    PID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'publicationType'  
    },
    Title:String,
    ISSN:String,
    Volume:String,
    CorrespondingAuthor:{
        type:String
    },
    FirstAuthor:String,
    CoAuthors:{
        type:Array
    }
    
   
})
const journalPublication=mongoose.model('journalPublication',JournalPublications);
module.exports=journalPublication;
const mongoose=require('mongoose')

const BookChapter=mongoose.Schema(
    {
        PID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'publicationType'
        },
        FID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'faculty'
        },
        ChapterTitle:{
            type:String
        },
        BookTitle:{
            type:String
        },
        Editor:{
            type:String
        },
        Edition:{
            type:String
        },
        Area:{
            type:String
        }
    }
)
const bookChapter=mongoose.model('bookChapter',BookChapter);
module.exports=bookChapter;
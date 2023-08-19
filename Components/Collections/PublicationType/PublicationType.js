
const mongoose=require('mongoose')
const PublcationType=new mongoose.Schema(
    {
        Type:{
           type:String
        },
        Name:{
            type:String
        },
        Year:{
            type:Date
        },
        Publisher:{
            type:String
        },
        // ISPN is just a term to identify uique id for each publication.
        ISPN:{
            type:String
        }
    }
)
const publcationType=mongoose.model('publicationType',PublcationType);
module.exports=publcationType;
const publicationType=require('../Collections/PublicationType/PublicationType')
const journal=require('../Collections/Journal/JournalPublication')
const app=require('express')
const router=app.Router();
const checkUser=require('../LoginMiddleware/checkUser');
const journalPublication = require('../Collections/Journal/JournalPublication');

// CREATE journal
router.post('/addJournal',checkUser,async(req,res)=>{
    const FID = req.user.id;

    //   Extract publication details
    const{Name,Year,Publisher,ISSN}=req.body;

     // extract Journal details
     const{Title,Volume,CorrespondingAuthor,FirstAuthor,CoAuthors}=req.body;

      // check if publication is already added in publication type or not 
    // flag to track if the publication type is new or old
    let pubFlag=true;
    let PID;

    if(await publicationType.findOne({ISPN:ISSN,Type:'JOURNAL'})){
        console.log("This publication already exists.")
        PID=await publicationType.findOne({ISPN:ISSN,Type:'JOURNAL'})
        pubFlag=false;
     }

    //   False means, publication type already exists and we have the PID
       if(!pubFlag)
    { 
        if(await journal.findOne({PID:PID,FID:FID,Title:Title})){
            return res.json({"Message":"Duplicate entry! Title already exists!"})
        }
    }

    if(pubFlag){ // if publication type is new then create new entry else ignore
        console.log("creating new publication type.")
        PID= await publicationType.create(
        {
           Type:"JOURNAL",
           Name:Name,
           Year:new Date(`${Year}`),
           Publisher:Publisher,
           ISPN:ISSN 
        }
    )}
    console.log("PID is ",PID)
    try{
    await journal.create(
        {
            PID: PID,
            FID: FID,
            Title:Title,
            ISSN:ISSN,
            Volume:Volume,
            CorrespondingAuthor: CorrespondingAuthor,
            FirstAuthor: FirstAuthor,
            CoAuthors: CoAuthors

        }
    )
    }catch(err){
        return res.json({"Message":"Internal Server Error!"})
    }
    return res.json({"Message":"Journal added successfully.","Status":201})

}
)

// READ bookChapters

router.get('/readJournals',checkUser,async(req,res)=>{
    const FID=req.user.id;
    // Match FID and type==Chapter and fetch PID
    const PID=await publicationType.find({FID:FID,Type:"JOURNAL"}).select('_id');
    const data=await journal.find({FID:FID,PID:PID}).populate('PID');
    const result=data.map((item,i)=>{
        return {
            JournalName: data[i].PID.Name,
            Year:data[i].PID.Year.getFullYear(),
            Publisher: data[i].PID.Publisher,
            ISSN: data[i].PID.ISPN,
            Title: data[i].Title,
            
            
            Volume:data[i].Volume,
            CorrespondingAuthor: data[i].CorrespondingAuthor,
            FirstAuthor: data[i].FirstAuthor,
            CoAuthors: data[i].CoAuthors,
            
        }

    })
    return res.json(result);
})

// UPDATE journal
router.put('/updateJournal',checkUser,async(req,res)=>{
    const FID=req.user.id;
    let {Title, NewTitle,ISSN,Volume, CorrespondingAuthor, FirstAuthor,  CoAuthors } = req.body;
     // find the PID of requested chapter
     const PID = await publicationType.findOne({ FID:FID, ISPN: ISSN, Type: "JOURNAL" }).select('_id');

     if (!PID) {
         return res.json({ "Message": "ISSN not found.", "Status": 404 })
     }

      // check if the new title is duplicate or not 
    console.log("New Title: ", NewTitle, " Old Title: ", Title)
    if (NewTitle != Title) {
        if (await journal.findOne({ PID: PID, FID: FID,Title: NewTitle })) {
            return res.json({ "Message": "Duplicate Journal Title detected!" })
        }
    }
     try{
        await journal.updateOne(
            { PID: PID, FID: FID, Title: Title }, {
            Title:NewTitle,
            Volume:Volume,
            ISSN:ISSN,
            CorrespondingAuthor: CorrespondingAuthor,
            FirstAuthor: FirstAuthor,
            CoAuthors: CoAuthors
        })
}catch(err){
    return res.json({"Message":"Interval Server Error!"})
}
return res.json({"Message":"Journal updated successfully.","Status":202})
// If title has been updated then find the publication using new title.
NewTitle?Title=NewTitle:Title;
const chapter=await journal.findOne({PID:PID,FID:FID,Title:Title});
return res.json(chapter)
})


// DELETE Journals
router.delete('/deleteJournal',checkUser,async(req,res)=>{
    const FID=req.user.id;
    const ISSN=req.body.deleteData.ISSN;
    const Title=req.body.deleteData.Title;
    console.log(req.body)
    const PID=await publicationType.findOne({ISPN:ISSN,"Type":"JOURNAL"}).select('_id');
    console.log(PID)
   // if PID does not exist or has already been deleted.
    if(!PID){
        return res.json({"Message":"Publication not found."})
    }
   
    try{
        // if chapter does not exist or has already been deleted.
        if(!await journal.findOne({FID:FID,PID:PID,Title:Title}))
        {
            return res.json({"Message":"Journal not found."})
        }
    
        await journal.deleteOne({FID:FID,PID:PID,Title:Title});
    }catch(err){
        console.log("Generated error is",err)
        return res.json({"Message":"Internal server error."})
    }
    return res.json({"Message":"Journal deleted successfully.","Status":200})
})


// Read all with faculty information to display in admin page
router.get('/admin/readJournals',checkUser ,async (req,res)=>{
    // const PID=await publicationType.find({Type:'BOOK'})
    try{
    const data=await journalPublication.find().populate(['FID','PID'])
    // return res.json(data)
    const result=data.map((item,i)=>{
          return {
            Name:item.FID.Name,
            Email:item.FID.Email,
            Phone:item.FID.Phone,
            Department:item.FID.Department,
            Designation:item.FID.Designation,
            JournalName:item.PID.Name,
            Year:item.PID.Year.getFullYear(),
            Publisher:item.PID.Publisher,
            ISSN:item.PID.ISPN,
            JournalTitle:item.Title,
            Volume:item.Volume,
            CorrespondingAuthor:item.CorrespondingAuthor,
            FirstAuthor:item.FirstAuthor,
            CoAuthors:item.CoAuthors
          }
    })
    return res.json(result)

    }catch(err){
        return res.json(err)
    }
})
module.exports=router;
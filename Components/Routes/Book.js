const publicationType=require('../Collections/PublicationType/PublicationType')
const bookPublication=require('../Collections/Book/BookPublication')
const faculty=require('../Collections/User')
const app=require('express')
const router=app.Router();
const checkUser=require('../LoginMiddleware/checkUser')

// CREATE bookChapter
router.post('/addBook',checkUser,async(req,res)=>{
    const FID = req.user.id;

    //   find if user is adding publication or chapter
    const{Name, Year,Publisher,ISBN}=req.body;

     // extract book information
     const{Title,Editor,Edition,Area,CoAuthors}=req.body;

      // check if publication is already added in publication type or not 
    // flag to track if the publication type is new or old
    let pubFlag=true;
    let PID;

    if(await publicationType.findOne({ISPN:ISBN,Type:"BOOK"})){
        console.log("This publication already exists.")
        PID=await publicationType.findOne({ISPN:ISBN,Type:"BOOK"})
        pubFlag=false;
     }

     
    //   False means, publication type already exists and we have the PID
       if(!pubFlag){ 
        if(await bookPublication.findOne({PID:PID,FID:FID,Title:Title})){
            return res.json({"Message":"Duplicate entry.Title already exists."})
        }
    }

    if(pubFlag){ // if publication type is new then create new entry else ignore
        console.log("creating new publication type.")
        PID= await publicationType.create(
        {
           Type:"BOOK",
           Name:Name,
           Year:new Date(`${Year}`),
           Publisher:Publisher,
           ISPN:ISBN 
        }
    )}
    console.log("PID is ",PID)
    
    await bookPublication.create(
        {
            PID:PID,
            FID:FID,
            Title:Title,
            Editor:Editor,
            Edition:Edition,
            Area:Area,
            CoAuthors:CoAuthors

        }
    )
    return res.json({"Message":"Book added successfully.","Status":201})

}
)

// READ bookBooks

router.get('/readBooks',checkUser,async(req,res)=>{
    const FID=req.user.id;
    // Match FID and type==Book and fetch PID
    const PID=await publicationType.find({FID:FID,Type:"BOOK"}).select('PID');
    const data=await bookPublication.find({FID:FID,PID:PID}).populate('PID');
    console.log(data)
    const result=data.map((item,i)=>{
        return {
        BookName:data[i].PID.Name,
        Year:data[i].PID.Year.getFullYear(),
        Publisher:data[i].PID.Publisher,
        ISBN:data[i].PID.ISPN,
        Title:data[i].Title,
        Editor:data[i].Editor,
        Edition:data[i].Edition,
        Area:data[i].Area,
        CoAuthors:data[i].CoAuthors
       }

    })
    return res.json(result);
})

// UPDATE Book
router.put('/updateBook',checkUser,async(req,res)=>{
    const FID=req.user.id;
    console.log('Faculty id',FID)
    console.log("requested body is", req.body)
    let {ISBN,Title,NewTitle,Edition,Editor,Area,CoAuthors}=req.body;
    // find the PID of requested chapter
    const PID=await publicationType.findOne({ISPN:ISBN,Type:"BOOK"}).select('_id');
    console.log('Pubication id',PID)
    if(!PID){
        return res.json({"Message":"ISBN not found.","Status":404})
    }
    // check if the new title is duplicate or not 
    console.log("New Title: ",NewTitle, " Old Title: ",Title)
    if(NewTitle!=Title){
    if(await bookPublication.findOne({PID:PID,FID:FID,Title:NewTitle})){
        return res.json({"Message":"Duplicate Book Title detected!"})
    }
}
    console.log('Updating publication',await bookPublication.findOne({PID:PID,FID:FID,Title:Title}))
     try{
    await bookPublication.updateOne({PID:PID,FID:FID,Title:Title},{
        Title:NewTitle,
        Edition:Edition,
        Editor:Editor,
        Area:Area,
        CoAuthors:CoAuthors
    })
}catch(err){
    return res.json({"Message":"Interval Server Error!"})
}
NewTitle?Title=NewTitle:Title;
const chapter=await bookPublication.findOne({PID:PID,FID:FID,Title:Title});
return res.json({"Message":"Book Updated successfully.",Status:202})
})


// DELETE book
router.delete('/deleteBook',checkUser,async(req,res)=>{
    const FID=req.user.id;
    // const {ISBN,Title}=req.body;
    const ISBN=req.body.deleteData.ISBN;
    const Title=req.body.deleteData.Title;
    console.log("About to delete ISBN is",req.body)
    const PID=await publicationType.findOne({ISPN:ISBN,"Type":"BOOK"}).select('_id');
   // if PID does not exist or has already been deleted.
    if(!PID){
        return res.json({"Message":"Publication not found."})
    }
   
    try{
        // if book does not exist or has already been deleted.
        if(!await bookPublication.findOne({FID:FID,PID:PID,Title:Title}))
        {
            return res.json({"Message":"Book not found."})
        }
    
        await bookPublication.deleteOne({FID:FID,PID:PID,Title:Title});
    }catch(err){
        console.log("Generated error is",err)
        return res.json(err)
    }
    return res.json({"Message":"Book deleted successfully.","Status":200})
})


// Read all with faculty information to display in admin page
router.get('/admin/readBooks',checkUser ,async (req,res)=>{
    // const PID=await publicationType.find({Type:'BOOK'})
    try{
    const data=await bookPublication.find().populate(['FID','PID'])
    const result=data.map((item,i)=>{
          return {
            Name:item.FID.Name,
            Email:item.FID.Email,
            Phone:item.FID.Phone,
            Department:item.FID.Department,
            Designation:item.FID.Designation,
            BookName:item.PID.Name,
            Year:item.PID.Year.getFullYear(),
            Publisher:item.PID.Publisher,
            ISBN:item.PID.ISPN,
            BookTitle:item.Title,
            Editor:item.Editor,
            Area:item.Area,
            CoAuthors:item.CoAuthors,
            Edition:item.Edition
          }
    })
    return res.json(result)
    // return res.send(await JSON.stringify(result))

    }catch(err){
        return res.json(err)
    }
})
module.exports=router;
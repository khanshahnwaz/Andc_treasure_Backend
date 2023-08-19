const publicationType = require('../Collections/PublicationType/PublicationType')
const bookChapter = require('../Collections/Book/BookChapter')
const app = require('express')
const router = app.Router();
const checkUser = require('../LoginMiddleware/checkUser')

// CREATE bookChapter
router.post('/addChapter', checkUser, async (req, res) => {
    const FID = req.user.id;

    // Extract Book Information 
    const { Name, Year, Publisher, ISBN } = req.body;

    // extract chapter information
    const { ChapterTitle, BookTitle, Editor, Edition, Area } = req.body;


    // flag to track if the publication type is new or old
    let pubFlag = true;
    let PID;

    // check if publication is already added in publication type or not 
    if (await publicationType.findOne({ ISPN: ISBN, Type: "CHAPTER" })) {
        console.log("This publication already exists.")
        PID = await publicationType.findOne({ ISPN: ISBN, Type: "CHAPTER" })
        pubFlag = false;
    }

    const { chapterTitle } = req.body;
    //   False means, publication type already exists and we have the PID
    if (!pubFlag) {
        if (await bookChapter.findOne({ PID: PID, FID: FID, ChapterTitle: ChapterTitle })) {
            return res.json({ "Message": "Duplicate entry! BookTitle already exists." })
        }
    }

    try {
        if (pubFlag) { // if publication type is new then create new entry else ignore
            console.log("creating new publication type.")
            PID = await publicationType.create(
                {
                    Type: "CHAPTER",
                    Name: Name,
                    Year: new Date(`${Year}`),
                    Publisher: Publisher,
                    ISPN: ISBN
                }
            )
        }
        console.log("PID is ", PID)

        await bookChapter.create(
            {
                PID: PID,
                FID: FID,
                ChapterTitle: ChapterTitle,
                BookTitle: BookTitle,
                Editor: Editor,
                Edition: Edition,
                Area: Area

            }
        )
        return res.json({ "Message": "Book Chapter added successfully.", "Status": 201 })
    } catch (err) {
        return res.json({ "Message": "Internal server error! " })
    }
}
)

// READ bookChapters
router.get('/readChapters', checkUser, async (req, res) => {
    const FID = req.user.id;
    console.log(FID)
    // Match FID and type==Chapter and fetch PID
    const PID = await publicationType.find({ Type: "CHAPTER" }).select('_id');
    console.log(PID)
    const data = await bookChapter.find({ FID: FID, PID: PID }).populate('PID');
    console.log(data)
    const result = data.map((item, i) => {
        return {
            BookName: data[i].PID.Name,
            Year: data[i].PID.Year.getFullYear(),
            Publisher: data[i].PID.Publisher,
            ISBN: data[i].PID.ISPN,
            ChapterTitle: data[i].ChapterTitle,
            BookTitle: data[i].BookTitle,
            Editor: data[i].Editor,
            Edition: data[i].Edition,
            Area: data[i].Area
        }

    })
    return res.json(result);
})

// UPDATE BookChapters
router.put('/editChapter', checkUser, async (req, res) => {
    const FID = req.user.id;
    let { ISBN, ChapterTitle, NewChapterTitle, BookTitle, Edition, Editor, Area } = req.body;
    // find the PID of requested chapter
    const PID = await publicationType.findOne({FID:FID, ISPN: ISBN, Type: "CHAPTER" }).select('_id');

    if (!PID) {
        return res.json({ "Message": "ISBN not found.", "Status": 404 })
    }

    // check if the new title is duplicate or not 
    console.log("New Title: ", NewChapterTitle, " Old Title: ", ChapterTitle)
    if (NewChapterTitle != ChapterTitle) {
        if (await bookChapter.findOne({ PID: PID, FID: FID, ChapterTitle: NewChapterTitle })) {
            return res.json({ "Message": "Duplicate Chapter Title detected!" })
        }
    }
        try {
            await bookChapter.updateOne(
                {
                    PID: PID,
                    FID: FID,
                    ChapterTitle: ChapterTitle
                },
                {
                    ChapterTitle: NewChapterTitle,
                    BookTitle: BookTitle,
                    Edition: Edition,
                    Editor: Editor,
                    Area: Area
                })
        } catch (err) {
            return res.json({ "Message": "Internal server error." })
        }
        NewChapterTitle ? ChapterTitle = NewChapterTitle : ChapterTitle;
        const chapter = await bookChapter.findOne({ PID: PID, FID: FID, ChapterTitle: ChapterTitle });
        return res.json({ "Message": "Chapter updated successfully.", "Status": 202 })
    })


// DELETE bookChapters
router.delete('/deleteChapter', checkUser, async (req, res) => {
    const FID = req.user.id;
    console.log('FID',FID)
    const ISBN=req.body.deleteData.ISBN;
    const ChapterTitle=req.body.deleteData.Title;
    console.log("Chapter to be deleted is: ",req.body.deleteData)
    const PID = await publicationType.findOne({ ISPN: ISBN,Type:"CHAPTER" }).select('_id');
    console.log("PID",PID)
    // if PID does not exist or has already been deleted.
    if (!PID) {
        return res.json({ "Message": "Publication not found." })
    }

    try {
        // if chapter does not exist or has already been deleted.
        if (!await bookChapter.findOne({ FID: FID, PID: PID, ChapterTitle: ChapterTitle })) {
            return res.json({ "Message": "Chapter not found." })
        }

        await bookChapter.deleteOne({ FID: FID, PID: PID, ChapterTitle: ChapterTitle });
    } catch (err) {
        console.log("Generated error is", err)
        return res.json({"Message":"Interval server error!"})
    }
    return res.json({ "Message": "Chapter deleted successfully.","Status":200 })
})

// Read all with faculty information to display in admin page
router.get('/admin/readChapters',checkUser ,async (req,res)=>{
    // const PID=await publicationType.find({Type:'BOOK'})
    try{
    const data=await bookChapter.find().populate(['FID','PID'])
    // return res.json(data)
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
            BookTitle:item.BookTitle,
            ChapterTitle:item.ChapterTitle,
            Editor:item.Editor,
            Area:item.Area,
            Edition:item.Edition
          }
    })
    return res.json(result)

    }catch(err){
        return res.json(err)
    }
})
module.exports = router;
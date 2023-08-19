const publicationType = require('../Collections/PublicationType/PublicationType')
const conference = require('../Collections/Conference/ConferencePublication')
const app = require('express')
const router = app.Router();
const checkUser = require('../LoginMiddleware/checkUser');
const conferencePublication = require('../Collections/Conference/ConferencePublication');

// CREATE Conference
router.post('/addConference', checkUser, async (req, res) => {
    const FID = req.user.id;

    //   find if user is adding publication or chapter
    const { Name, Year, Publisher, ISBN } = req.body;

    // extract conference information
    const { Title, CorrespondingAuthor, FirstAuthor, Presented, National, Place, CoAuthors } = req.body;

    // check if publication is already added in publication type or not 
    // flag to track if the publication type is new or old
    let pubFlag = true;
    let PID;

    if (await publicationType.findOne({ ISPN: ISBN, Type: "CONFERENCE" })) {
        console.log("This publication already exists.")
        PID = await publicationType.findOne({ ISPN: ISBN })
        pubFlag = false;
    }

    //   False means, publication type already exists and we have the PID
    if (!pubFlag) {
        if (await conference.findOne({ PID: PID, FID: FID, PaperTitle: Title, 'Type': 'CONFERENCE' })) {
            return res.json({ "Message": "Duplicate entry.Conference already exists." })
        }
    }

    if (pubFlag) { // if publication type is new then create new entry else ignore
        console.log("creating new publication type.")
        PID = await publicationType.create(
            {
                Type: "CONFERENCE",
                Name: Name,
                Year: new Date(`${Year}`),
                Publisher: Publisher,
                ISPN: ISBN
            }
        )
    }
    console.log("PID is ", PID)

    await conference.create(
        {
            PID: PID,
            FID: FID,
            PaperTitle: Title,
            CorrespondingAuthor: CorrespondingAuthor,
            FirstAuthor: FirstAuthor,
            PaperPresented: Presented,
            National: National,
            Place: Place,
            CoAuthors: CoAuthors

        }
    )
    return res.json({ "Message": "Conference added successfully.", "Status": 201 })

}
)

// READ conferences
router.get('/readConferences', checkUser, async (req, res) => {
    const FID = req.user.id;
    // Match FID and type==Chapter and fetch PID
    const PID = await publicationType.find({ FID: FID, Type: "CONFERENCE" }).select('_id');
    console.log(PID)
    console.log('FID',FID)
    const data = await conference.find({ FID: FID, PID: PID }).populate('PID');
    console.log(data)
    const result = data.map((item, i) => {
        return {
            ConferenceName: data[i].PID.Name,
            Year: data[i].PID.Year.getFullYear(),
            Publisher: data[i].PID.Publisher,
            ISSN: data[i].PID.ISPN,
            PaperTitle: data[i].PaperTitle,
            CorrespondingAuthor: data[i].CorrespondingAuthor,
            FirstAuthor: data[i].FirstAuthor,
            Presented: data[i].PaperPresented,
            National: data[i].National,
            Place: data[i].Place,
            CoAuthors: data[i].CoAuthors
        }

    })
    return res.json(result);
})

// UPDATE conferences
router.put('/updateConference', checkUser, async (req, res) => {
    const FID = req.user.id;
    let { ISSN, PaperTitle, NewTitle, CorrespondingAuthor, FirstAuthor, Presented, National, Place, CoAuthors } = req.body;
    // find the PID of requested chapter
    const PID = await publicationType.findOne({ ISPN: ISSN,Type:"CONFERENCE" }).select('_id');
    if(!PID)
      return res.json({"Messsage":"Publication not found!"
      })

      // check if the new title is duplicate or not 
    console.log("New Title: ",NewTitle, " Old Title: ",PaperTitle)
    if(NewTitle!=PaperTitle){
    if(await conference.findOne({PID:PID,FID:FID,PaperTitle:NewTitle})){
        return res.json({"Message":"Duplicate Title Detected!"})
    }
}
    try {
        await conference.updateOne(
            { PID: PID, FID: FID, PaperTitle: PaperTitle }, {
            PaperTitle: NewTitle,
            CorrespondingAuthor: CorrespondingAuthor,
            FirstAuthor: FirstAuthor,
            PaperPresented: Presented,
            National: National,
            Place: Place,
            CoAuthors: CoAuthors
            // Year: data[i].PID.Year.getFullYear()
        })
    } catch (err) {
        return res.json({"Message":"Internal Server Error!"})
    }
    NewTitle ? PaperTitle = NewTitle : PaperTitle;
    const chapter = await conference.findOne({ PID: PID, FID: FID, PaperTitle: PaperTitle });

    return res.json({"Message":"Conference Updated Successfully!","Status":202})
})


// DELETE Conference
router.delete('/deleteConference', checkUser, async (req, res) => {
    const FID = req.user.id;
    const ISSN=req.body.deleteData.ISSN;
    const Title=req.body.deleteData.PaperTitle;
    console.log('Deleting conference is',req.body)
    const PID = await publicationType.findOne({ ISPN: ISSN,
    'Type':"CONFERENCE" }).select('_id');
    console.log(PID)
    // if PID does not exist or has already been deleted.
    if (!PID) {
        return res.json({ "Message": "Publication not found." })
    }

    try {
        // if conference does not exist or has already been deleted.
        if (!await conference.findOne({ FID: FID, PID: PID, PaperTitle: Title })) {
            return res.json({ "Message": "Conference not found." })
        }

        await conference.deleteOne({ FID: FID, PID: PID, PaperTitle: Title });
    } catch (err) {
        console.log("Generated error is", err)
        return res.json({"Message":"Internal Server Error!"})
    }
    return res.json({ "Message": "Conference deleted successfully.", "Status": 200 })
})

// Read all with faculty information to display in admin page
router.get('/admin/readConferences',checkUser ,async (req,res)=>{
    // const PID=await publicationType.find({Type:'BOOK'})
    try{
    const data=await conferencePublication.find().populate(['FID','PID'])
    // return res.json(data)
    const result=data.map((item,i)=>{
          return {
            Name:item.FID.Name,
            Email:item.FID.Email,
            Phone:item.FID.Phone,
            Department:item.FID.Department,
            Designation:item.FID.Designation,
            ConferenceName:item.PID.Name,
            Year:item.PID.Year.getFullYear(),
            Publisher:item.PID.Publisher,
            ISSN:item.PID.ISPN,
            PaperTitle:item.PaperTitle,
            National:item.National,
            Presented:item.PaperPresented,
            Place:item.Place,
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
module.exports = router;
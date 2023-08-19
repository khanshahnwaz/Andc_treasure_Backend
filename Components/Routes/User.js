const app = require('express');
const user = require('../Collections/User');
const router = app.Router();
// bcrypt for password hashing 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // to generate tokens 
const secretKey = "This is Shahnwaz Khan";
const {Auth}=require('two-step-auth')
const nodemailer=require('nodemailer')

// Route 1: Register new user . Login not required
router.post('/signUp', async (req, res) => {
    // console.log("Hi I am here.")
    console.log("Requested data is",req.body)

    const check = await user.findOne({ Email: req.body.email });
    if (check) {
        console.log("Email already exists.")
        return res.json({ Message: "Email already exists.",status:400 })
    }
    // Encrypting password to keep safe 
    // generate salt 
    const salt = await bcrypt.genSalt(10);
    // generate hash
    const hashedPassword = await bcrypt.hash(req.body.password, salt);


    const create = await user.create({
        Name: req.body.name,
        Email: req.body.email,
        Phone:req.body.phone,
        Department: req.body.department,
        Designation: req.body.designation,
        Password: hashedPassword
    })
    if (create) {
        const payLoad = {
            user: {
                id: create._id
            }
        }
        const token = jwt.sign(payLoad, secretKey);
        const userData={
            name:create.Name,
            email:create.Email,
            phone:create.Phone,
            department:create.Department,
            designation:create.Designation,
        }
        return res.status(201).json({Message:"Account created successfully.",token:token,status:201,data:userData});
    } else return res.status(401).json({Message: "Internal server error." })

})


// Router 2 : Login register user . No login required
router.post('/login', async (req, res) => {
    console.log("I am hit ");
    const { Email, Password } = req.body;
    const checkEmail = await user.findOne({ Email: Email });
    if (!checkEmail) {
        return res.status(404).json({ Message: "Account not found." })
    }
    const oldPassword = await user.findOne({ Email: Email });
    // console.log(oldPassword)
    const checkPassword =  await bcrypt.compare(Password, oldPassword.Password);
    if (!checkPassword) {
        console.log("Password did not match.")
        return res.status(401).json({ Message: "Wrong password detected.",status:401 })
    }else console.log("Password matched. Welcome to andc_treasure.")
    const payLoad = {
        user: {
            id: oldPassword._id
        }
    }

    const userData={
        name:oldPassword.Name,
        email:oldPassword.Email,
        phone:oldPassword.Phone,
        department:oldPassword.Department,
        designation:oldPassword.Designation,
    }
    const token = jwt.sign(payLoad, secretKey);
    // localStorage.setItem('token', token)
    return res.json({ Message: "Welcome to andc_treasure.", token,status:200,data:userData})

})

// Route 3: Forgot Password
router.put('/forgotPassword',async(req,res)=>{
    const mail=req.body;
    try{
    // const email=await Auth(mail,"andc_treasure");
    // console.log("Requested mail id for forgot password ",email.mail)
    // console.log("Sent otp is",email.otp)

    const transport=nodemailer.createTransport({
        service:"gmail",
        auth:{
            user:"avengershahnwaz@gmail.com",
            pass:"khanbhai"
        }
    })
    const mailoptions={
        from:"avengershahnwaz@gmail.com",
        to:"avengershahnwaz@gmail.com",
        subject:"OTP verification",
        text:"Your otp is 0786"
    }
    transport.sendMail(mailoptions, function(error, info){
        if (error) {
          console.log("nodemailer error ",error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }catch(err){
        console.log("Server error ",err)
    }
})
module.exports = router;
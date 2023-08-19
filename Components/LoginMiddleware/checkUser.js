const jwt= require('jsonwebtoken');
const secretKey="This is Shahnwaz Khan";

const checkUser=(req,res,next)=>{
    try{
        const token=req.header('auth-token');
        const payLoad=jwt.verify(token,secretKey);
        // console.log("Hello sir",payLoad);
        req.user=payLoad.user;
        next();
    }catch(error){
        return res.status(401).json({Error:"Access denied."})
    }
}
module.exports=checkUser;
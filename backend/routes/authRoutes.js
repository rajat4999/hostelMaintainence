const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const student= require('./../models/student');
const express=require('express');
const router=express.Router();

// create account
router.post('/signup',async(req,res)=>{
  try{
    const userData=req.body;
    const user=new student(userData);
    const response=await user.save();

    const payload={
      regNo:user.regNo,
      role:user.role,
      id:user.id
    }
    
    const token=generateToken(payload);
    
    
    res.status(200).json({response,token});
    console.log("account created successfully");
    // res.send(`account created successfully`);

  }
  catch(err){
    res.status(500).json({error:err});
  }
});


// login

router.post('/login',async(req,res)=>{
  try{
    const {email,password}= req.body;
    const user=await student.findOne({email:email});
    if(!user || !user.comparePassword(password)) return res.status(404).json({error:"incorrect email or password"});

    const payload={
      email:user.email,
      role:user.role,
      id:user.id
    }

    const token=generateToken(payload);

    res.send({token});
    

  }
  catch(err){
    res.status(500).json({error:err});
    console.log(err);
  }
})


module.exports=router;
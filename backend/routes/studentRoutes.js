const student= require('./../models/student');
const complaint=require('./../models/complaint');
const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../jwt');

const checkStudent=(user)=>{
  try{
    return user.role==='Student';
  }
  catch(err){
    return false;
  }
}
// post a complaint by student
router.post('/file',jwtAuthMiddleware,async (req,res)=>{
  const id=req.user.id;
  try{
    const user=await student.findById(id);
    if(!checkStudent(user)) return res.status(403).json({error:"caretaker cannot file complaint"});
    const data={
      student:id,
      ...req.body
    }
    const newComplaint=new complaint(data);
    const response=await newComplaint.save();
    console.log("complaint register successfully");
    res.status(200).json(response);

  }
  catch(err){
    res.status(500).json({error:'server error'});
  }
});


// view all the complaints common and personal.
router.get('/view',jwtAuthMiddleware,async (req,res)=>{
  try{
    const id=req.user.id;
    const user=await student.findById(id);
    if(!user) return res.status(404).json({error:'token expired'});

    const comps=await complaint.find({
      $or:[
        {student:id},
        {isCommon:true}
      ]
    }).sort({date:-1});

    res.status(200).json(comps);

  }
  catch(err){
    res.status(500).json({error:'server error'});
  }
});


// update profile

router.put('/profile/update',jwtAuthMiddleware,async(req,res)=>{
  try{
    const id=req.user.id;
    const user=await student.findById(id);
    if(!user) return res.status(404).json({error:"token not found"});
    const {room,hostel,mobNo,newPassword}=req.body;
    if(room) user.room=room;
    if(hostel) user.hostel=hostel;
    if(mobNo) user.mobNo=mobNo;
    if(newPassword) user.password=newPassword;
    const response=await user.save();
    console.log("profile updated");
    res.send(response);

  }
  catch(err){
    console.log(err);
    res.status(500).json({error:err});
  }
});








module.exports=router;
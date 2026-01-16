const student= require('./../models/student');
const complaint=require('./../models/complaint');
const notice=require('./../models/notice');
const sendEmail=require('./../services/emailService');
const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const checkStudent=require('./../middleware/checkStudent');

// post a complaint by student
router.post('/file',jwtAuthMiddleware,checkStudent,async (req,res)=>{
  const id=req.user.id;
  try{
    const user=await student.findById(id);
    const data={
      student:id,
      ...req.body,
      hostel:user.hostel
    }
    const newComplaint=new complaint(data);
    const response=await newComplaint.save();
    console.log("complaint register successfully");


     try{
      // email notification
        const subject=`Complaint Received Successfully`;
        const to=user.email;
        const text=`Hello ${user.name},\n\nWe have received your complaint regarding "${req.body.category}".\n\nComplaint ID: ${response._id}\nStatus: Pending\n\nA caretaker will review it shortly.\n\nRegards,\nHostel Management`;
    
        await sendEmail(to,subject,text);
     }
     catch(err){
      console.log(err);
     }

    res.status(200).json(response);

  }
  catch(err){
    res.status(500).json({error:'server error'});
  }
});


// view all the complaints common and personal.
router.get('/view',jwtAuthMiddleware,checkStudent,async (req,res)=>{
  try{
    const id=req.user.id;
    const user=await student.findById(id);
    if(!user) return res.status(404).json({error:'token expired'});

    const comps=await complaint.find({
      $or:[
        {student:id},
        {isCommon:true}
      ]
    }).sort({createdAt:-1});

    res.status(200).json(comps);

  }
  catch(err){
    res.status(500).json({error:'server error'});
  }
});


// update profile

router.put('/profile/update',jwtAuthMiddleware,checkStudent,async(req,res)=>{
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
    res.status(500).json({error:"server error"});
  }
});


//reopen the complaints under 10days

router.patch('/:compId/reopen',jwtAuthMiddleware,checkStudent,async(req,res)=>{
  try{
    const stdId=req.user.id;
    const {compId}=req.params;
    const {reason}=req.body;
    if(!reason) return res.status(400).json({ error: "Reason is required" });

    const comp=await complaint.findOne({_id:compId,student:stdId});
    if(!comp) return res.status(404).json({message:"complaint not found"});

    if (comp.status!== 'resolved') return res.status(400).json({ error:"Only resolved complaints can be reopened."});

    const currentDate=new Date();
    const resolvedDate=new Date(comp.resolvedAt);

    const timeDiff=currentDate-resolvedDate;

    const dayDiff=timeDiff/(1000*3600*24);

    if(dayDiff>10) return res.status(403).json({message:"You can only reopen complaints within 10 days of resolution."});

    comp.status='pending';
    comp.reopenReason=reason;
    comp.reopenedAt=new Date();

    await comp.save();

    try{
      const user = await student.findById(stdId);
      // email notification
      const subject=`Complaint Reopened`;
      const to=user.email;
      const text=`Hi ${user.name},\n\nYour complaint regarding "${comp.category}" has been successfully REOPENED.\n\nReason: ${reason}.\n\nA caretaker will review it again shortly.\n\nRegards,\nHostel Management`;
            
      await sendEmail(to,subject,text);
    }
    catch(err){
      console.log(err);
    }



    res.status(200).json({message:"Complaint reopened",comp});

  }
  catch(err){
    console.log(err);
    res.status(500).json({error:"server error"});
  }
});



// view notice

router.get('/notices',jwtAuthMiddleware,checkStudent,async (req,res)=>{
  try{
    const stdId=req.user.id;
    const user=await student.findById(stdId);
    const notices=await notice.find({hostel:user.hostel}).sort({createdAt:-1});

    res.status(200).json(notices);


  }
  catch(err){
    res.status(500).json({error:"server error"});
  }
});



module.exports=router;
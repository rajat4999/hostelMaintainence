const student= require('./../models/student');
const complaint=require('./../models/complaint');
const notice=require('./../models/notice');
const sendEmail=require('./../services/emailService');
const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const checkCaretaker=require('./../middleware/checkCaretaker');
const upload=require('./../middleware/upload');
const worker= require('./../models/worker');

// if user is caretaker then he can able to see all complaints

router.get('/view-all',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  const id=req.user.id;
  try{
    const ct=await student.findById(id);
    if(!ct) return res.status(404).json({error:"token expired"});
    const hostel=ct.hostel;
    const complaints=await complaint.find({hostel:hostel}).populate('student','name room hostel mobNo').sort({createdAt:-1});

    complaints.sort((a,b)=>{
      if(a.status==='pending'  && b.status!=='pending') return -1;
      if(a.status!=='pending'  && b.status==='pending') return 1;
      return 0;

    });
    res.status(200).json(complaints);
                      

  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }

});



// add workers to their databases

router.post('/add-worker',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  const id=req.user.id;
  const hostel=req.user.hostel;
  try{
    // const ct=await student.findById(id);
    // if(!ct) return res.status(404).json({error:"token expired"});

    const newWorker=new worker({
      ...req.body,
      hostel:hostel
    });

    await newWorker.save();
    res.status(200).json({message:"worker added successfully",worker:newWorker});

  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
});





// view worker by category
router.get('/get-worker',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  const id=req.user.id;
  const hostel=req.user.hostel;
  try{
    // const ct=await student.findById(id);
    // if(!ct) return res.status(404).json({error:"token expired"});

    const {category}=req.query;

    const filter={hostel:hostel};
    if(category){
      filter.category=category;
    }

    const workers=await worker.find(filter);
    res.status(200).json(workers);
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
})



// assigned the worker and update status 

router.patch('/:compId/assign',jwtAuthMiddleware,checkCaretaker,async(req,res)=>{

  const ctId=req.user.id;
  try{
    // const ct=await student.findById(ctId);
    // if(!ct) return res.status(404).json({error:"token expired"});

    const {compId}=req.params;
    const comp=await complaint.findById(compId).populate('student');
    if(!comp) res.status(404).json({error:"complaint not found"});

    const {workId}=req.body;
    const workers=await worker.findById(workId);
    if(!workers) return res.status(404).json({error:"worker not found"});

    if(comp.status==='assigned') return res.status(400).json({message:"worker already assigned"});
    if(comp.status==='resolved') return res.status(400).json({message:"complaint already resolved"});
    comp.status='assigned';
    comp.workerMob=workers.mobNo;
    comp.workerName=workers.name;
    comp.assignAt=new Date();

    await comp.save();

    try{
      // email notification
      const subject=`Update: Worker Assigned for your Complaint`;
      const to=comp.student.email;
      const text=`Hello ${comp.student.name},\n\nA worker has been assigned to your complaint.\n\nComplaint Category: ${comp.category}\n\nWorker Name: ${comp.workerName}\nWorker Mobile: ${comp.workerMob}\n\nPlease be present in your room or coordinate with the worker.\n\nRegards,\nHostel Management`;
        
      await sendEmail(to,subject,text);
    }
    catch(err){
      console.log(err);
    }


    res.status(200).json({ message: "Worker Assigned Successfully", comp });

  }
  catch(err){
    console.log(err);
    res.status(500).json({error:"internal server error"});
  }


});




//routes to resolve the complaint

router.patch('/:compId/resolve',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  try{
    const {compId}=req.params;
    const comp=await complaint.findById(compId).populate('student');
    if(!comp) res.status(404).json({error:"complaint not found"});

    if(comp.status==='resolved') return res.status(400).json({message:"complaint already resolved"});

    comp.status='resolved';
    comp.resolvedAt=new Date();
    await comp.save();

    try{
      // email notification
      const subject=`Complaint Resolved`;
      const to=comp.student.email;
      const text=`Hello ${comp.student.name},\n\nGood news! Your complaint regarding "${comp.category}" has been marked as RESOLVED.\n\nComplaint ID: ${comp._id}\nResolved Date: ${new Date().toLocaleDateString()}\n\nIf the issue persists, please contact the caretaker office.\n\nRegards,\nHostel Management`;
        
      await sendEmail(to,subject,text);
    }
    catch(err){
      console.log(err);
    }

    res.status(200).json({message:"Complaint resolved successfully",comp});
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }

});



// routes to upload notice

router.post('/notice/upload',jwtAuthMiddleware,checkCaretaker,upload.single('photo'),async(req,res)=>{
  try{
    const {title,description}=req.body;
    const imageBase64=req.file?req.file.buffer.toString('base64'):null;

    const newNotice=new notice({
      title,
      description,
      image:imageBase64,
      hostel:req.user.hostel

    });

    await newNotice.save();

    res.status(200).json({message:"notice uploaded",newNotice});
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
});

// view notices

router.get('/notices',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  try{
    const stdId=req.user.id;
    const user=await student.findById(stdId);
    const notices=await notice.find({hostel:user.hostel}).sort({createdAt:-1});

    res.status(200).json(notices);


  }
  catch(err){
    res.status(500).json({error:"server error"});
  }
})



// router to delete notice 
router.delete('/notice/:notId/delete',jwtAuthMiddleware,checkCaretaker,async (req,res)=>{
  try{
    const {notId} =req.params;
    const response=await notice.findByIdAndDelete(notId);
    if(!response) return res.status(404).json({error:"notice not found"});
    res.status(200).json({message:"notice deleted successfully"});
  }
  catch(err){
    res.status(500).json({error:"internal server error"});
  }
});


module.exports=router;
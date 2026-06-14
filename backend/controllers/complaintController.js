const ComplaintService = require('../services/complaintService');


// get all complaints for care taker

const viewAllComplaints = async (req, res) => {
  try {
    const complaints = await ComplaintService.getAllComplaints(req.user.id);
    res.status(200).json(complaints);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}


// add worker
const addWorker=async(req,res)=>{

  try{
    const caretakerId=req.user.id;
    const workerData=req.body;
    const response=await ComplaintService.addWorker(caretakerId,workerData);
    res.status(201).json(response);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message }); 

  }
};

// delete worker
const deleteWorker=async(req,res)=>{
  try{
    const workerId=req.params.id;
    const response=await ComplaintService.deleteWorker(workerId);
    res.status(200).json(response);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message }); 
  }
};


// update worker data
const updateWorker=async(req,res)=>{
  try{
    const workerId=req.params.id;
    let updateData = {
      ...req.body
    };

    const response = await ComplaintService.updateWorker(workerId, updateData);
    res.status(200).json(response);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }


};


// view workers by category
const viewWorkersByCategory=async(req,res)=>{
  try{
    const caretakerId=req.user.id;
    const {category}=req.query;
    const response=await ComplaintService.viewWorkersByCategory(caretakerId,category);
    res.status(200).json(response);
  }catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


//assign worker to complaint and update complaint status
const assignWorker=async(req,res)=>{
  try{
    const caretakerId=req.user.id;
    const {compId}=req.params;
    const {workerId}=req.body;
    const response=await ComplaintService.assignWorkerToComplaint (caretakerId,compId,workerId);
    res.status(200).json(response);
  }catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// resolve complaint
const resolveComplaint=async(req,res)=>{
  try{
    const {compId}=req.params;
    const response=await ComplaintService.resolveComplaint(compId);
    res.status(200).json(response);
  }catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// upload notice

const uploadNotice=async(req,res)=>{
  try{
    const hostel=req.user.hostel;
    const noticeData=req.body;
    const response=await ComplaintService.uploadNotice(hostel,noticeData);
    res.status(201).json(response);
  }catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// view notices
const viewNotices=async(req,res)=>{
  try{
    const caretakerId=req.user.id;
    const response=await ComplaintService.viewNotices(caretakerId);
    res.status(200).json(response);
  }catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

// delete notice
const deleteNotice=async(req,res)=>{
  try{
    const {notId}=req.params;
    const response=await ComplaintService.deleteNotice(notId);
    res.status(200).json(response);
  }catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};



// get caretaker profile
const getCaretakerProfile=async(req,res)=>{
  try{  
    const user=req.user;
    const response=await ComplaintService.getCaretakerProfile(user);
    res.status(200).json(response);
  }catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


// reject complaint

const rejectComplaint = async (req, res) => {
  try {
    const { compId } = req.params;
    const { reason } = req.body;
    
    const result = await ComplaintService.rejectComplaint(compId, reason);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


module.exports={
  viewAllComplaints,
  addWorker,
  deleteWorker,
  updateWorker,
  viewWorkersByCategory,
  assignWorker,
  resolveComplaint,
  uploadNotice,
  viewNotices,
  deleteNotice,
  getCaretakerProfile,
  rejectComplaint
};



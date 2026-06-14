const student= require('./../models/student');
const complaint=require('./../models/complaint');
const notice=require('./../models/notice');
const sendEmail=require('./../services/emailService');
const { uploadToCloudinary,deleteFromCloudinary } = require('../config/cloudinary');
const worker=require('./../models/worker');


// care taker get all complaints

const getAllComplaints=async(caretakerId)=>{
  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;
  const complaints=await complaint.find({hostel:hostel}).populate('student','name room hostel mobNo regNo email').populate('worker').sort({createdAt:-1});

  complaints.sort((a,b)=>{
    if(a.status==='pending'  && b.status!=='pending') return -1;
    if(a.status!=='pending'  && b.status==='pending') return 1;
    return 0;

  });
  return complaints;
}


//add workers to their databases

const addWorker=async(caretakerId,workerData)=>{
  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;
  let photoUrl = null;
  if (workerData.photoBase64) {
    photoUrl = await uploadToCloudinary(workerData.photoBase64, 'worker_profiles');
  }
  const newWorker=new worker({
    ...workerData,
    hostel:hostel,
    image:photoUrl
  });
  
  await newWorker.save();
  return { message: "worker added successfully", worker: newWorker };


}


// delete worker

const deleteWorker=async(workerId)=>{

  const workerData = await worker.findById(workerId);
  if (!workerData) throw { statusCode: 404, message: "Worker not found" };

  if (workerData.activeTaskCount > 0) {
    throw { statusCode: 400, message: "Cannot delete a worker with active tasks. Please wait for them to finish or reassign their tasks first." };
  }

  if (workerData.image) {
      await deleteFromCloudinary(workerData.image);
  }


  await worker.findByIdAndDelete(workerId);    
  return { message: "Worker deleted successfully" } ;
}

// update worker data
const updateWorker=async(workerId,updateData)=>{

  const existingWorker = await worker.findById(workerId);
  if (!existingWorker) throw { statusCode: 404, message: "Worker not found" };

  if (updateData.photoBase64) {
    if (existingWorker.image) {
        await deleteFromCloudinary(existingWorker.image);
    }
    updateData.image = await uploadToCloudinary(updateData.photoBase64, 'worker_profiles');
  }

  const updatedWorker = await worker.findByIdAndUpdate(workerId, updateData, { new: true });
  return { message: "Worker updated", worker: updatedWorker };
}


// view workers by category

const viewWorkersByCategory=async(caretakerId,category)=>{
  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;


  const filter={hostel:hostel};
  if(category){
    filter.category=category;
  }

  const workers=await worker.find(filter).sort({activeTaskCount:1});
  return workers;


};


// assign worker to complaint and update complaint status
const assignWorkerToComplaint=async(caretakerId,complaintId,workerId)=>{

  const ct=await student.findById(caretakerId);
  if(!ct)throw { statusCode: 404, message: 'token expired' };
  const hostel=ct.hostel;


  const comp=await complaint.findById(complaintId).populate('student');
  if(!comp) throw { statusCode: 404, message: "complaint not found" };

  const workers=await worker.findById(workerId);
  if(!workers) throw { statusCode: 404, message: "worker not found" };

  if (comp.category !== workers.category) {
    throw { statusCode: 400, message: "Worker skill category does not match the complaint category." };
  }

  const compl = await complaint.findOneAndUpdate(
    { _id: complaintId, status: 'pending' }, 
    { status: 'assigned', worker: workerId, assignAt: new Date() },
    { new: true }
  ).populate('student');

  if (!compl) {
    throw { 
      statusCode: 409, // 409 means Conflict
      message: "Race condition prevented! Another caretaker assigned this complaint just moments ago." 
    };
  }
  workers.activeTaskCount += 1;
  await workers.save();

  try{
    // email notification
    const subject=`Update: Worker Assigned for your Complaint`;
    const to=comp.student.email;
    const text=`Hello ${comp.student.name},\n\nA worker has been assigned to your complaint.\n\nComplaint Category: ${comp.category}\n\nWorker Name: ${workers.name}\nWorker Mobile: ${workers.mobNo}\n\nPlease be present in your room and coordinate with the worker.\n\nRegards,\nHostel Management`;
        
    await sendEmail(to,subject,text);
  }
  catch(err){
    console.log(err);
  }


  return { message: "Worker Assigned Successfully", comp };


};


// resolve complaint
const resolveComplaint=async(complaintId)=>{

  const comp=await complaint.findById(complaintId).populate('student');
  if(!comp) throw { statusCode: 404, message: "complaint not found" };

  if(comp.status==='resolved') throw { statusCode: 400, message: "complaint already resolved" };

  comp.status='resolved';
  comp.resolvedAt=new Date();
  await comp.save();

  if (comp.worker) {
    await worker.findByIdAndUpdate(comp.worker, { $inc: { activeTaskCount: -1 } });
  }

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

  return { message: "Complaint resolved successfully", comp };

}


// upload notice
const uploadNotice=async(hostel,noticeData)=>{
  let imageUrl = null;

  // Check for the base64 string
  if (noticeData.photoBase64) {
    imageUrl = await uploadToCloudinary(noticeData.photoBase64, 'notices');
  }
  const newNotice=new notice({
    title: noticeData.title,
    description: noticeData.description,
    image: imageUrl,
    hostel: hostel
  });
  
  await newNotice.save();
  return { message: "notice uploaded", newNotice };


}

// view notice
const viewNotices=async(caretakerId)=>{
 const user=await student.findById(caretakerId);
  if(!user)throw { statusCode: 404, message: 'token expired' };

  const notices=await notice.find({hostel:user.hostel}).sort({createdAt:-1});

  return notices;
}


// delete notice
const deleteNotice=async(noticeId)=>{
  const noticeData = await notice.findById(noticeId);
  if (!noticeData) return { error: "notice not found" };

  if (noticeData.image) {
      await deleteFromCloudinary(noticeData.image);
  }

  await notice.findByIdAndDelete(noticeId);

  return { message: "notice deleted successfully" };
}


// get profile of caretaker
const getCaretakerProfile=async(user)=>{
  return ({ 
    name: user.name, 
    email: user.email, 
    hostel: user.hostel,
    mobNo: user.mobNo 
  });

};

// reject complaint

const rejectComplaint = async (compId, reason) => {
  if (!reason) throw { statusCode: 400, message: "A reason is required to reject a complaint." };

  const comp = await complaint.findById(compId).populate('student');
  if (!comp) throw { statusCode: 404, message: "Complaint not found." };

  // Security Lock: Prevent rejecting a complaint that is already finished
  if (comp.status === 'resolved' || comp.status === 'rejected') {
      throw { statusCode: 400, message: `This complaint is already marked as ${comp.status}.` };
  }

  // Update the state
  comp.status = 'rejected';
  comp.rejectReason = reason;
  await comp.save();

  if (comp.worker) {
    await worker.findByIdAndUpdate(comp.worker, { $inc: { activeTaskCount: -1 } });
  }

  // Async Email Notification to the Student
  const subject = `Update: Complaint Rejected`;
  const text = `Hello ${comp.student.name},\n\nYour complaint regarding "${comp.title}" has been REJECTED by the Caretaker.\n\nReason: ${reason}\n\nIf you believe this is an error, please visit the Caretaker office.\n\nRegards,\nHostel Management`;
  sendEmail(comp.student.email, subject, text).catch(console.error);

  return { message: "Complaint rejected successfully", comp };
};



module.exports={
  getAllComplaints,
  addWorker,
  deleteWorker,
  updateWorker,
  viewWorkersByCategory,
  assignWorkerToComplaint,
  resolveComplaint,
  uploadNotice,
  viewNotices,
  deleteNotice,
  getCaretakerProfile,
  rejectComplaint
}


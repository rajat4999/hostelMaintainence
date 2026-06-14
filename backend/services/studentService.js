const student= require('./../models/student');
const sendEmail=require('./../services/emailService');
const { uploadToCloudinary,deleteFromCloudinary } = require('../config/cloudinary');
const complaint=require('./../models/complaint');
const notice=require('./../models/notice');



// file a complaint

const createComplaint = async (studentId, complaintData) => {
  
  let imageUrl=null;

    if(complaintData.imageBase64){
      imageUrl = await uploadToCloudinary(complaintData.imageBase64,'image');
    }
    const user=await student.findById(studentId);
    const data={
      student:studentId,
      ...complaintData,
      hostel:user.hostel,
      image:imageUrl
    }

    const newComplaint=new complaint(data);
    const response=await newComplaint.save();
    console.log("complaint register successfully");
    console.log(imageUrl);
    
    try{
      // email notification
      const subject=`Complaint Received Successfully`;
      const to=user.email;
      const text=`Hello ${user.name},\n\nWe have received your complaint regarding "${complaintData.category}".\n\nComplaint ID: ${response._id}\nStatus: Pending\n\nA caretaker will review it shortly.\n\nRegards,\nHostel Management`;
    
      await sendEmail(to,subject,text);
    }
    catch(err){
      console.log(err);
    }

  return response;


};

// get student complaints

const getStudentComplaints = async (studentId) => {
  const user=await student.findById(studentId);

  if(!user) throw { statusCode: 404, message: 'token expired' };

  const comps=await complaint.find({
    $or:[
      {student:studentId},
      {isCommon:true,hostel: user.hostel}
    ]
  }).populate('student', 'name room')
  .populate('worker')
  .sort({createdAt:-1});
  return comps;

};


// reopen a complaint
const reopenComplaint = async (studentId, complaintId, reason) => {

  const comp=await complaint.findOne({_id:complaintId,student:studentId});
  if (!comp) throw { statusCode: 404, message: "Complaint not found" };
  if (comp.status !== 'resolved') throw { statusCode: 400, message: "Only resolved complaints can be reopened." };

  const currentDate=new Date();
  const resolvedDate=new Date(comp.resolvedAt);
  
  const timeDiff=currentDate-resolvedDate;
  
  const dayDiff=timeDiff/(1000*3600*24);
  
  if(dayDiff>10) throw { statusCode: 403, message: "You can only reopen complaints within 10 days of resolution." };
  
  comp.status='pending';
  comp.reopenReason=reason;
  comp.reopenedAt=new Date();
  
  await comp.save();
  
  try{
    const user = await student.findById(studentId);
    // email notification
    const subject=`Complaint Reopened`;
    const to=user.email;
    const text=`Hi ${user.name},\n\nYour complaint regarding "${comp.category}" has been successfully REOPENED.\n\nReason: ${reason}.\n\nA caretaker will review it again shortly.\n\nRegards,\nHostel Management`;
              
    await sendEmail(to,subject,text);
  }
  catch(err){
    console.log(err);
  }
  return { message: "Complaint reopened", comp };

}



// view notice
const viewNotices = async (studentId) => {

  const user=await student.findById(studentId);
  if(!user) throw { statusCode: 404, message: 'token expired' };
  const notices=await notice.find({hostel:user.hostel}).sort({createdAt:-1});
  return notices;

}


// get student profile

const getProfile = async (studentId) => {
  const user=await student.findById(studentId).select('-password');
  if(!user) throw { statusCode: 404, message: 'token expired' };
  return user;
}


// update student profile

const updateProfile = async (studentId, updateData) => {
  const user=await student.findById(studentId);
  if(!user) throw { statusCode: 404, message: 'token expired' };

  if (updateData.room || updateData.hostel) {
    const activeComplaints = await complaint.find({
      student: studentId,
      isCommon: false, // Ensure it's a personal complaint
      status: { $in: ['pending', 'assigned'] }
    });

    if (activeComplaints.length > 0) {
      throw { 
        statusCode: 400, 
        message: 'Cannot change room or hostel with active personal complaints. Please wait for them to be resolved or withdraw them.' 
      };
    }
  }

  const allowedFields=['name','mobNo','hostel','room'];
  for(let key in updateData){
    if(allowedFields.includes(key)){
      user[key]=updateData[key];
    }
  }
  await user.save();
  return user;
};

// withdraw complain


const withdrawComplaint = async (studentId, compId) => {
  const comp = await complaint.findOne({ _id: compId, student: studentId });
  
  if (!comp) throw { statusCode: 404, message: "Complaint not found." };
  
  if (comp.status !== 'pending') {
      throw { statusCode: 403, message: "You can only withdraw complaints that are still pending." };
  }

  if (comp.image) {
     await deleteFromCloudinary(comp.image);
  }

  await complaint.findByIdAndDelete(compId);
  
  return { message: "Complaint permanently withdrawn and deleted." };
};


module.exports={
  createComplaint,
  getStudentComplaints,
  reopenComplaint,
  viewNotices,
  getProfile,
  updateProfile,
  withdrawComplaint
};

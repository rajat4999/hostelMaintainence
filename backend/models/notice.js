const mongoose=require('mongoose');
const noticeSchema=new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String
  },
  image:{
    type:String  //url of image
  },
  hostel:{
    type:String,
    required:true
  }
},{timestamps:true});

const notice=mongoose.model('notice',noticeSchema);
module.exports=notice;
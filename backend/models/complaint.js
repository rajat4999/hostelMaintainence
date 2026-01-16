const mongoose=require('mongoose');
const complaintSchema=new mongoose.Schema({
  student:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'student',
    required:true
  },
  category:{
    type:String,
    enum:['electrical','plumbing','cleaning','furniture','other'],
    required:true
  },
  description:{
    type:String,
    required: true,
  },
  isCommon:{
    type:Boolean,
    default:false,
    required:true
  },
  location:{
    type:String,
    trim:true,
    required:function() {return this.isCommon==true}
  },
  status:{
    type:String,
    enum:['pending','assigned','resolved'],
    default:'pending'
  },
  image:{
    type:String  //url of image
  },
  hostel:{
    type:String,
    required:true
  },
  workerName:{
    type:String
  },
  workerMob:{
    type:String,
    validate:{
      validator: (v)=>{
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props=>`${props.value} is not a valid number`
    }
  },
  assignAt:{
    type:Date
  },
  resolvedAt:{
    type:Date
  },
  reopenReason:{type:String},
  reopenedAt:{type:Date}
},{timestamps:true});

const complaint=mongoose.model('complaint',complaintSchema);
module.exports=complaint;
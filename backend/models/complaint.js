const mongoose=require('mongoose');
const complaintSchema=new mongoose.Schema({
  student:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'student',
    required:true
  },
  title:{
    type: String,
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
    enum:['pending','assigned','resolved','rejected'],
    default:'pending'
  },
  rejectReason:{
    type: String,
    required:function() {return this.status==='rejected'}
  },
  image:{
    type:String  //url of image
  },
  hostel:{
    type:String,
    required:true
  },
  worker: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'worker' 
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
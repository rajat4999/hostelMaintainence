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
    required:()=> {return this.isCommon==true}
  },
  date:{
    type:Date,
    default:Date.now()
  },
  status:{
    type:String,
    enum:['pending','worker assigned','resolved'],
    default:'pending'
  },
  resolvedOn:{
    type:Date
  },
  image:{
    type:String  //url of image
  }
});

const complaint=mongoose.model('complaint',complaintSchema);
module.exports=complaint;
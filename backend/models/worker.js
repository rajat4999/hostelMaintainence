const mongoose=require('mongoose');
const workerSchema=new mongoose.Schema({
  name:{
    type:String,
    requied:true
  },
  category:{
    type:String,
    enum:['electrical','plumbing','cleaning','furniture','other'],
    required:true
  },
  image:{
    type:String,  //url of image
  },
  mobNo:{
    type:String,
    validate:{
      validator: (v)=>{
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props=>`${props.value} is not a valid number`
    }
  },
  hostel:{
    type:String,
    required:true
  }
});

const worker=mongoose.model('worker',workerSchema);
module.exports=worker;
const express= require('express');
const mongoose=require('mongoose');
// const { validate } = require('../../../projects/demo/models/Person');
const bcrypt=require('bcrypt');
const studentSchema=new mongoose.Schema({
  email:{
    type: String,
    required: true,
    unique:true
  },
  password:{
    type: String,
    required: true,
    // select: false
  },
  regNo:{
    type: String,
    unique:true,
    required:function(){return this.role=='Student'}

  },
  name:{
    type: String,
    required: true
  },
  hostel:{
    type: String,
    enum: ['SVBH','Patel','Tilak','Tondon','NBH Block-A','NBH Block-B','NBH Block-C','Malviya'],
    required :true
  },
  room:{
    type: String,
    required:function(){return this.role=='Student'}
  },
  mobNo: {
    type: String,
    required: true,
    unique:true,
    validate:{
      validator: (v)=>{
        return /^[6-9]\d{9}$/.test(v);
      },
      message: props=>`{$props.value} is not a valid number`
    }
  },
  role:{
    type: String,
    enum:['Student','Caretaker'],
    default:'Student',
    required:true
  }
});


// hashing
studentSchema.pre('save',async function(){
  const student=this;
  if(!this.isModified('password')) return;
  try{
    const salt=await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(this.password,salt);
    this.password=hashedPassword
  }
  catch(err){
    throw err;
  }
});

studentSchema.methods.comparePassword=async function(password){
  try{
    const isMatch=await bcrypt.compare(password,this.password);
    return isMatch;
  }
  catch(err){
    throw err;
  }
}



const student=mongoose.model('student',studentSchema);
module.exports=student;
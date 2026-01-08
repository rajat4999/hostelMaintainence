const express= require('express');
const mongoose=require('mongoose');
const { validate } = require('../../../projects/demo/models/Person');
const studentSchema=new mongoose.Schema({
  college_email:{
    type: String,
    required: true,
    unique:true
  },
  password:{
    type: String,
    required: true,
    select: false
  },
  regNo:{
    type: String,
    required: true,
    unique:true
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
    required:true
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
    required:true
  }
});

const student=mongoose.model('student',studentSchema);
module.exports=student;
const mongoose=require('mongoose');
require('dotenv').config();
const localMongo='mongodb://127.0.0.1:27017/HostelMaintainence';
mongoose.connect(localMongo);
const db= mongoose.connection;

db.on('connected',()=>{
  console.log(`database connected successfully`);
});

db.on('error',(err)=>{
  console.log(`error while connection: ${err}`);
});

db.on('disconnected',()=>{
  console.log(`database disconnected`);
});

module.exports= db;
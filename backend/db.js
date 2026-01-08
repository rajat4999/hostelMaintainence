const mongooose=require('mongoose');
require('dotenv').config();
const localMongo=process.env.LOCALMONGO;
mongooose.connect(localMongo);
const db= mongoose.connetion;

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
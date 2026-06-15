const mongoose=require('mongoose');
require('dotenv').config();
const mongoUri=process.env.MONGO_URI ;
const localMongo=process.env.LOCALMONGO;

mongoose.connect(mongoUri);
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
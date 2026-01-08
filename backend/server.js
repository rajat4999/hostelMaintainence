const express= require('express');
require('dotenv').config();
const db=require('./db');
const app=express();
app.get('/',(req,res)=>{
  res.send("hello to hostel maintence app");
});
const port=process.env.PORT || 3000;
app.listen(port,()=>{
  console.log(`app running on local host on port ${port}`);
})

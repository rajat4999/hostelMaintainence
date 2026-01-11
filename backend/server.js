const express= require('express');
require('dotenv').config();
const db=require('./db');
const bodyParser=require('body-parser');
const authRoutes=require('./routes/authRoutes');
const studentRoutes=require('./routes/studentRoutes');



const app=express();
app.use(bodyParser.json());


app.get('/',(req,res)=>{
  res.send("hello to hostel maintence app");
});



app.use('/auth',authRoutes);
app.use('/student',studentRoutes);

const port=process.env.PORT || 3000;
app.listen(port,()=>{
  console.log(`app running on local host on port ${port}`);
})

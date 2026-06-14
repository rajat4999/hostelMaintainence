const express= require('express');
require('dotenv').config();
const db=require('./config/db');
const cors = require('cors');
const bodyParser=require('body-parser');
const authRoutes=require('./routes/authRoutes');
const studentRoutes=require('./routes/studentRoutes');
const complaintRoutes=require('./routes/complaintRoutes');


const app=express();
app.use(cors());

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));






app.get('/',(req,res)=>{
  res.send("hello to samadhan Setu");
});



app.use('/auth',authRoutes);
app.use('/student',studentRoutes);
app.use('/caretaker',complaintRoutes);

const port=process.env.PORT || 3000;
app.listen(port,()=>{
  console.log(`app running on local host on port ${port}`);
})

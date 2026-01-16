const nodemailer=require('nodemailer');
const transporter=nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
});


const sendEmail=async(to,subject,text)=>{
  const mailOptions={
    from:process.env.EMAIL_USER,
    to:to,
    subject:subject,
    text:text
  };

  try{
    await transporter.sendMail(mailOptions);
    console.log("email sent successfully");
  }
  catch(err){
    console.log(err);
  }
}

module.exports=sendEmail;
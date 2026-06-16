const nodemailer=require('nodemailer');
const transporter=nodemailer.createTransport({
  service:'gmail',
  port: 465,
  secure: true,
  auth:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
});


const sendEmail=async(to,subject,text)=>{

  const isRender=process.env.RENDER==='true';
  try{
    if(isRender){
      console.log(`[EMAIL SYSTEM] Cloud mode active. Sending via Brevo API to: ${to}`);
      
      if (!process.env.BREVO_API_KEY || !process.env.EMAIL_USER) {
        console.error("[EMAIL SYSTEM FAILED] Missing BREVO_API_KEY or EMAIL_USER in Render!");
        return;
      }
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: "Samadhan Setu", email: process.env.EMAIL_USER },
          to: [{ email: to }],
          subject: subject,
          textContent: text
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[EMAIL SYSTEM] Brevo API Error Details:", errorData);
      } else {
        console.log("[EMAIL SYSTEM] Success! Email sent via Brevo API.");
      }
    }


    else{
      const mailOptions={
      from:process.env.EMAIL_USER,
      to:to,
      subject:subject,
      text:text
      };


  
      await transporter.sendMail(mailOptions);
      console.log("email sent successfully through nodemailer");
  }
  }
  catch(err){
    console.log(err);
  }
}

module.exports=sendEmail;
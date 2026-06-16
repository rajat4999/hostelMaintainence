const crypto = require('crypto');
const Student = require('../models/student');
const Otp = require('../models/otp');
const sendEmail = require('./emailService');
const { generateToken } = require('../middleware/jwt');




// genertae signUp otp
const generateSignupOtp = async (email) => {



    // if (!email.endsWith("@mnnit.ac.in")) {
    //     throw { statusCode: 403, message: "You must use your official college email (@mnnit.ac.in)." };
    // }


    const existingUser = await Student.findOne({ email });
    if (existingUser) {
        throw { statusCode: 400, message: "An account with this email already exists." };
    }

    const existingOtpRecord = await Otp.findOne({ email });
    if (existingOtpRecord) {
        const secondsSinceLastOtp = (Date.now() - existingOtpRecord.createdAt.getTime()) / 1000;
            
        if (secondsSinceLastOtp < 60) {
            throw { statusCode: 429, message: `Please wait ${Math.ceil(60 - secondsSinceLastOtp)} seconds before requesting a new code.` };
        }
    }

    const plainOtp = crypto.randomInt(100000, 1000000).toString();  
    const hashedOtp = crypto.createHash('sha256').update(plainOtp).digest('hex');

    await Otp.findOneAndUpdate(
        { email },
        { email, otp: hashedOtp ,createdAt: Date.now()},
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 5. Send Email
    const subject = "Verify Your Samadhan Setu Account";
    const message = `Welcome!\n\nYour account verification code is: ${plainOtp}\n\nThis code will expire in 10 minutes.`;    
    await sendEmail(email, subject, message);
    return { message: "OTP sent successfully!" };
}


// resgister user

const registerUser = async (userData) => {
    if (!userData.otp) throw { statusCode: 400, message: "OTP is required to create an account." };

    // 1. Verify OTP
    const hashedOtp = crypto.createHash('sha256').update(userData.otp).digest('hex');
    const validOtpRecord = await Otp.findOneAndDelete({ 
        email: userData.email,
        otp: hashedOtp
    });
    
    if (!validOtpRecord) throw { statusCode: 400, message: "Invalid or expired OTP." };

    // 2. Validate Caretaker Secret
    if (userData.role === 'Caretaker') {
        delete userData.room;
        delete userData.regNo;
        if (userData.adminSecret !== process.env.CARETAKER_SECRET_KEY) {
            throw { statusCode: 403, message: "Unauthorized: Invalid Admin Secret Key." };
        }
    }

    // 3. Save User
    const user = new Student(userData);
    const response = await user.save();
    
    // 4. Cleanup OTP & Generate Token
    // await Otp.deleteOne({ email: userData.email });
    const payload = { 
        email: user.email,
        role: user.role,
        id: user.id,
        hostel: user.hostel 
    };
    const token = generateToken(payload);

    // 5. Async Welcome Email
    try{
      const subject="welcome to Samadhan Setu";
      const to=user.email;
      const text=`Hi ${user.name},\n\nYour account has been successfully created.\n\nHostel: ${user.hostel}\nRoom: ${user.room}\n\nYou can now login and file complaints.\n\nRegards,\nHostel Admin`;

      await sendEmail(to,subject,text);

    } catch(err){
      console.log("Signup Email Error:", err);
    }

    return { response, token };
};



// authenticate user login and generate token
const authenticateUser = async (email, password) => {
    const user = await Student.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        throw { statusCode: 401, message: "Incorrect email or password" };
    }

    const payload = { 
        email: user.email,
        role: user.role,
        id: user.id,
        hostel: user.hostel 
    };
    return generateToken(payload);
};



// forgotPassword otp

const forgotPassword = async (email) => {
    const user = await Student.findOne({ email });
    if (!user) {
        throw { statusCode: 404, message: "No account found with that email address." };
    }
    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    const subject = `Your Password Reset OTP -  Samadhan Setu`;
    const message = `Hello ${user.name},\n\nYour One-Time Password (OTP) to reset your password is:\n\n${otp}\n\nThis code is valid for 10 minutes. Please do not share it with anyone.`;

    try {
        await sendEmail(user.email, subject, message);
    } catch (err) {
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save({ validateBeforeSave: false });
        
        throw { statusCode: 500, message: "Email could not be sent" };
    }
};


// verify reset otp
const verifyResetOtp = async (email, otp) => {
    const user = await Student.findOne({ email });
    if (!user) throw { statusCode: 404, message: "User not found." };

    const hashedIncomingOtp = crypto.createHash('sha256').update(otp).digest('hex'); 
    if (user.resetOtp !== hashedIncomingOtp) throw { statusCode: 400, message: "Incorrect OTP. Please try again." };
    if (user.resetOtpExpire < Date.now()) throw { statusCode: 400, message: "OTP has expired. Please resend." };

    return true;
};

// reset password

const resetPassword = async (email, otp, newPassword) => {
  const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const user = await Student.findOne({
        email: email,
        resetOtp: hashedOtp,
        resetOtpExpire: { $gt: Date.now() }
    });
    if (!user) {
        throw { statusCode: 400, message: "Invalid or expired OTP." };
    }
    user.password = newPassword;

    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    
    await user.save();
};


// resend otp
const resendOTP = async (email) => {
    const user = await Student.findOne({ email });
    if (!user) {
        throw { statusCode: 404, message: "No account found with that email address." };
    }

    if (user.lastOtpSentAt) {
        const timeSinceLastOtp = Date.now() - user.lastOtpSentAt.getTime();
        const cooldownPeriod = 60 * 1000; // 60 seconds

        if (timeSinceLastOtp < cooldownPeriod) {
            const secondsLeft = Math.ceil((cooldownPeriod - timeSinceLastOtp) / 1000);
            throw { statusCode: 429, message: `Please wait ${secondsLeft} seconds before requesting a new OTP.` };
        }
    }

    const otp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    const subject = `Your NEW Password Reset OTP - Samadhan Setu`;
    const message = `Hello ${user.name},\n\nYou requested a new One-Time Password (OTP). Your new code is:\n\n${otp}\n\nThis code is valid for 10 minutes.`;

    try {
        await sendEmail(user.email, subject, message);
    } catch (err) {
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        user.lastOtpSentAt = undefined;
        await user.save({ validateBeforeSave: false });
        throw { statusCode: 500, message: "Email could not be sent" };
    }
};


module.exports = {
    generateSignupOtp,
    registerUser,
    authenticateUser,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    resendOTP
};
const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../middleware/jwt');
const checkStudent=require('./../middleware/checkStudent');
const StudentController=require('./../controllers/studentController');


router.use(jwtAuthMiddleware, checkStudent);

// complaints
router.post('/file', StudentController.fileComplaint);
router.get('/view', StudentController.getStudentComplaints);
router.patch('/:compId/reopen', StudentController.reopenComplaint);
router.delete('/:compId/withdraw', StudentController.withdrawComplaint);

// notices
router.get('/notices', StudentController.viewNotices);

// profile
router.get('/profile', StudentController.getProfile);
router.put('/profile/update', StudentController.updateProfile);

module.exports=router;
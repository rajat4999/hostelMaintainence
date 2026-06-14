const express=require('express');
const router=express.Router();
const {jwtAuthMiddleware,generateToken}=require('./../middleware/jwt');
const checkCaretaker=require('./../middleware/checkCaretaker');
const ComplaintController=require('./../controllers/complaintController');

router.use(jwtAuthMiddleware,checkCaretaker);


// complaints

router.get('/view-all', ComplaintController.viewAllComplaints);
router.patch('/:compId/assign', ComplaintController.assignWorker);
router.patch('/:compId/resolve', ComplaintController.resolveComplaint);
router.patch('/:compId/reject', ComplaintController.rejectComplaint);

// Workers
router.post('/add-worker', ComplaintController.addWorker);
router.get('/get-worker', ComplaintController.viewWorkersByCategory);
router.put('/worker/:id', ComplaintController.updateWorker);
router.delete('/worker/:id', ComplaintController.deleteWorker);

// Notices
router.post('/notice/upload', ComplaintController.uploadNotice);
router.get('/notices', ComplaintController.viewNotices);
router.delete('/notice/:notId/delete', ComplaintController.deleteNotice);

// Profile
router.get('/profile', ComplaintController.getCaretakerProfile);


module.exports=router;
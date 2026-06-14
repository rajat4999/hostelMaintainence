const StudentService = require('../services/studentService');

// file a complaint by student
const fileComplaint = async (req, res) => {
  const studentId = req.user.id;
  const complaintData = req.body;
  try {
    const complaint = await StudentService.createComplaint(studentId, complaintData);
    res.status(201).json(complaint);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// get student complaints
const getStudentComplaints = async (req, res) => {
  const studentId = req.user.id;
  try {
    const complaints = await StudentService.getStudentComplaints(studentId);
    res.status(200).json(complaints);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// reopen a complaint
const reopenComplaint = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { compId} = req.params;
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Reason is required" });
    const { message, comp } = await StudentService.reopenComplaint(studentId, compId, reason);
    res.status(200).json({ message, comp });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// view notices
const viewNotices = async (req, res) => {
  const studentId = req.user.id;
  try {
    const notices = await StudentService.viewNotices(studentId);
    res.status(200).json(notices);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// get student profile
const getProfile = async (req, res) => {
  const studentId = req.user.id;
  try {
    const profile = await StudentService.getProfile(studentId);
    res.status(200).json(profile);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// update student profile
const updateProfile = async (req, res) => {
  const studentId = req.user.id;
  const updateData = req.body;
  try {
    const profile = await StudentService.updateProfile(studentId, updateData);
    res.status(200).json(profile);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};


// withdraw complaint 
const withdrawComplaint = async (req, res) => {
  try {
    const result = await StudentService.withdrawComplaint(req.user.id, req.params.compId);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};


module.exports = {
  fileComplaint,
  getStudentComplaints,
  reopenComplaint,
  viewNotices,
  getProfile,
  updateProfile,
  withdrawComplaint
};
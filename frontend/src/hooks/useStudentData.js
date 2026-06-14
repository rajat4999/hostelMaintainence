// src/hooks/useStudentData.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export const useStudentData = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Student", hostel: "", room: "", email: "" });
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // 1. Parallel Fetching for speed
      const [profileRes, viewRes, noticeRes] = await Promise.all([
        api.get("/student/profile"),
        api.get("/student/view"),
        api.get("/student/notices")
      ]);

      // 2. Set Data
      setUser(profileRes.data);
      setComplaints(viewRes.data);
      setNotices(noticeRes.data);

      // 3. Calc Stats
      setStats({
        total: viewRes.data.length,
        pending: viewRes.data.filter(c => c.status !== 'resolved').length,
        resolved: viewRes.data.filter(c => c.status === 'resolved').length
      });

      // 4. Set Notifications
      setNotifications(viewRes.data.filter(c => c.status === 'resolved').map(c => ({
        id: c._id, text: `Complaint "${c.title}" resolved!`, time: new Date(c.updatedAt).toLocaleDateString()
      })));

    } catch (err) {
      console.error("Data Load Error", err);
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  const fileComplaint = async (complaintData) => {
    await api.post("/student/file", { ...complaintData, hostel: user.hostel });
    toast.success("Complaint Filed!");
    fetchAllData(); // Refresh
  };

  const updateProfile = async (profileData) => {
    try{
        await api.put("/student/profile/update", profileData);
        toast.success("Profile Updated!");
        fetchAllData();
    }catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update profile";
      toast.error(errorMessage);
      throw error; 
    }
  };

  const reopenComplaint = async (compId, reason) => {
    await api.patch(`/student/${compId}/reopen`, { reason });
    toast.success("Reopened Successfully");
    fetchAllData();
  };

  const withdrawComplaint = async (compId) => {

    await api.delete(`/student/${compId}/withdraw`);
    toast.success("Complaint withdrawn successfully.");
    fetchAllData(); 
};

  return { 
    user, complaints, notices, stats, notifications, loading, 
    logout, fileComplaint, updateProfile, reopenComplaint ,withdrawComplaint
  };
};
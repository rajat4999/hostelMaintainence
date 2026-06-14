import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";

export const useCaretakerData = () => {
  const navigate = useNavigate();
  // NEW: Store User Profile
  const [user, setUser] = useState({ name: "Caretaker", email: "", hostel: "" });
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchProfile(); // <--- Fetch Profile on load
  }, []);

  // NEW: Fetch Profile Function
  const fetchProfile = async () => {
    try {
      const res = await api.get("/caretaker/profile");
      setUser(res.data);
    } catch (err) {
      console.error("Profile Load Error");
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [compRes, workerRes, noticeRes] = await Promise.all([
        api.get("/caretaker/view-all"),
        api.get("/caretaker/get-worker"),
        api.get("/caretaker/notices")
      ]);

      setComplaints(compRes.data);
      setWorkers(workerRes.data);
      setNotices(noticeRes.data);

      setStats({
        total: compRes.data.length,
        pending: compRes.data.filter(c => c.status === 'pending').length,
        resolved: compRes.data.filter(c => c.status === 'resolved').length
      });

    } catch (err) {
      console.error("Caretaker Data Error", err);
    } finally {
      setLoading(false);
    }
  };

  // ... (keep assignWorker, resolveComplaint, addWorker, postNotice, deleteNotice same as before)
  
  const assignWorker = async (complaintId, workerId) => {
    try {
      await api.patch(`/caretaker/${complaintId}/assign`, { workerId: workerId });
      toast.success("Worker Assigned Successfully");
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment Failed");
    }
  };

  const resolveComplaint = async (complaintId) => {
    try {
      await api.patch(`/caretaker/${complaintId}/resolve`);
      toast.success("Complaint Resolved!");
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to resolve");
    }
  };

  const addWorker = async (workerData) => {
    try {
      await api.post("/caretaker/add-worker", workerData);
      toast.success("Worker Added");
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to add worker");
    }
  };

  const postNotice = async (noticeData) => {
    try {
      // Send standard JSON! No FormData needed.
      await api.post("/caretaker/notice/upload", noticeData);
      
      toast.success("Notice Posted");
      fetchDashboardData();
    } catch (err) {
      toast.error("Failed to post notice");
    }
  };

  const deleteNotice = async (noticeId) => {
    try {
      await api.delete(`/caretaker/notice/${noticeId}/delete`);
      toast.success("Notice Deleted");
      fetchDashboardData();
    } catch (err) {
      toast.error("Deletion failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/");
  };

  const updateWorker = async (workerId, updatedData) => {
    try {
      await api.put(`/caretaker/worker/${workerId}`, updatedData);
      toast.success("Worker updated successfully");
      fetchDashboardData(); // Refresh the list
    } catch (err) {
      toast.error("Failed to update worker");
    }
  };

  const toggleWorkerAvailability = async (workerId, currentStatus) => {
    const newStatus = !currentStatus;
    
    try {
      // 1. Instantly update the UI so the switch feels snappy
      setWorkers(prevWorkers => 
        prevWorkers.map(w => w._id === workerId ? { ...w, isAvailable: newStatus } : w)
      );

      // 2. Tell the backend (Reusing your existing PUT route!)
      await api.put(`/caretaker/worker/${workerId}`, { isAvailable: newStatus });
      toast.success(newStatus ? "Worker marked as On Duty" : "Worker marked as Off Duty");
      
    } catch (err) {
      // Revert if API fails
      setWorkers(prevWorkers => 
        prevWorkers.map(w => w._id === workerId ? { ...w, isAvailable: currentStatus } : w)
      );
      toast.error("Failed to update availability");
    }
  };

  const deleteWorker = async (workerId) => {
    try {
      await api.delete(`/caretaker/worker/${workerId}`);
      toast.success("Worker removed");
      fetchDashboardData(); // Refresh the list
    } catch (err) {
      toast.error("Failed to delete worker");
    }
  };


  const rejectComplaint = async (compId, reason) => {
    try {
      await api.patch(`/caretaker/${compId}/reject`, {reason} );
      
      toast.success("Complaint rejected successfully");
      fetchDashboardData();
      
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reject complaint");
    }
  };

  return {
    user, // <--- Export user
    complaints, workers, notices, stats, loading,
    assignWorker, resolveComplaint, addWorker, postNotice, deleteNotice, logout,updateWorker, deleteWorker,rejectComplaint,toggleWorkerAvailability
  };
};
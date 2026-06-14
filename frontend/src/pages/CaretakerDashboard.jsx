import { useState, useRef, useEffect } from "react";
import { useCaretakerData } from "../hooks/useCaretakerData";
import NoticeModal from "../components/dashboard/NoticeModal";
import StudentProfileModal from "../components/caretaker/StudentProfileModal";

// Components
import AssignWorkerModal from "../components/caretaker/AssignWorkerModal";
import ManageWorkersModal from "../components/caretaker/ManageWorkersModal";
import CaretakerComplaintDetails from "../components/caretaker/CaretakerComplaintDetails";

// Icons
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const UserIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;

const CaretakerDashboard = () => {
  const { 
    user, complaints, workers, notices, stats, loading,
    assignWorker, resolveComplaint, addWorker, postNotice, deleteNotice, logout,updateWorker, deleteWorker,rejectComplaint,toggleWorkerAvailability
  } = useCaretakerData();

  const [activeModal, setActiveModal] = useState(null); // 'assign', 'addWorker', 'details'
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeFilter, setActiveFilter] = useState('total');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const userMenuRef = useRef();
  
  // Notice Form State
  const [noticeForm, setNoticeForm] = useState({ title: "", description: "", photoBase64: null, previewUrl: null });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

 const handleNoticeSubmit = async (e) => {
    e.preventDefault();
    await postNotice(noticeForm); // Send standard JSON
    setNoticeForm({ title: "", description: "", photoBase64: null, previewUrl: null });
  };

  const handleNoticeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setNoticeForm({ 
            ...noticeForm, 
            photoBase64: reader.result, 
            previewUrl: reader.result 
        });
      };
    }
  };

  // Handler for opening details
  const openDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setActiveModal('details');
  };

  // Handler for opening assign modal FROM the details view
  const openAssignFromDetails = (complaint) => {
    // We keep the selectedComplaint set, but switch the modal view
    setActiveModal('assign'); 
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-purple-700 font-bold animate-pulse">Loading Caretaker Dashboard...</div>;

  const localStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      assigned: complaints.filter(c => c.status === 'assigned').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  const filteredComplaints = complaints.filter(c => {
      const matchesStatus = activeFilter === 'total' ? true : c.status === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' || 
          (c._id?.toString().toLowerCase().includes(query)) ||
          (c.student?.room?.toLowerCase().includes(query)) || 
          (c.student?.regNo?.toLowerCase().includes(query)) ||
          (c.worker?.name?.toLowerCase().includes(query)) ||
          (c.student?.name?.toLowerCase().includes(query));

          let matchesDate = true;

      if (startDate || endDate) {
          // Setup the boundaries (Local timezone safe)
          const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
          const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;

          // Gather every single timestamp where an "action" occurred
          const actionDates = [
              c.createdAt,    // When it was filed
              c.updatedAt,    // General updates/rejections
              c.assignAt,     // When a worker was assigned
              c.resolvedAt,   // When it was fixed
              c.reopenedAt    // When the student reopened it
          ]
          .filter(Boolean) // This removes any dates that don't exist yet (like resolvedAt for pending tasks)
          .map(dateStr => new Date(dateStr).getTime());

          // If AT LEAST ONE of these actions happened in the date range, show the complaint!
          matchesDate = actionDates.some(time => time >= start && time <= end);
      }
          return matchesStatus && matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow px-8 py-4 flex justify-between items-center sticky top-0 z-20 border-b border-purple-100">
        <h1 className="text-2xl font-extrabold text-purple-800 tracking-tight">Samadhan Setu</h1>
        <h1 className="text-2xl font-extrabold text-purple-800 tracking-tight">Caretaker Panel</h1>
        
        <div className="flex items-center gap-6">
            {/* Welcome Message */}
            <span className="hidden md:block text-gray-600 font-medium">
                Welcome, <span className="text-purple-700 font-bold">{user.name}</span>
            </span>

            {/* Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
                <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                >
                    <UserIcon />
                </button>

                {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-64 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
                        <div className="p-4 border-b bg-gray-50">
                            <p className="text-xs text-gray-500 uppercase font-bold">Signed in as</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">Hostel: {user.hostel}</p>
                        </div>
                        
                        <div className="p-2">
                            <button 
                                onClick={() => { setActiveModal('manageWorkers'); setShowUserMenu(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition flex items-center gap-3 font-medium"
                            >
                                <span className="bg-purple-100 p-1 rounded text-purple-600"><PlusIcon /></span>
                                Manage Workers
                            </button>
                            
                            <div className="h-px bg-gray-100 my-1"></div>
                            
                            <button 
                                onClick={logout}
                                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-3 font-medium"
                            >
                                <span className="bg-red-100 p-1 rounded text-red-600"><LogoutIcon /></span>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Stats */}
        {/* Stats / Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            <StatCard 
                title="Total" count={localStats.total} color="bg-gray-50 text-gray-800 border-gray-200" 
                isActive={activeFilter === 'total'} onClick={() => setActiveFilter('total')} 
            />
            <StatCard 
                title="Pending" count={localStats.pending} color="bg-yellow-50 text-yellow-800 border-yellow-200" 
                isActive={activeFilter === 'pending'} onClick={() => setActiveFilter('pending')} 
            />
            <StatCard 
                title="Assigned" count={localStats.assigned} color="bg-blue-50 text-blue-800 border-blue-200" 
                isActive={activeFilter === 'assigned'} onClick={() => setActiveFilter('assigned')} 
            />
            <StatCard 
                title="Resolved" count={localStats.resolved} color="bg-green-50 text-green-800 border-green-200" 
                isActive={activeFilter === 'resolved'} onClick={() => setActiveFilter('resolved')} 
            />
            <StatCard
                title="Rejected" count={localStats.rejected} color="bg-red-50 text-red-800 border-red-200" 
                isActive={activeFilter === 'rejected'} onClick={() => setActiveFilter('rejected')} 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: COMPLAINTS TABLE (2/3 Width) */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Incoming Complaints</h2>
                
                {/* --- NEW: COMPLAINTS SECTION HEADER & FILTERS --- */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        
                        {/* Search Bar */}
                        <div className="flex-1 w-full">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="ID, room, student, worker..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Date From */}
                        <div className="w-full md:w-36">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-600"
                            />
                        </div>

                        {/* Date To */}
                        <div className="w-full md:w-36">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 transition text-gray-600"
                            />
                        </div>

                        {/* Reset Button */}
                        {(startDate || endDate || searchQuery) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); }}
                                className="px-4 py-2 bg-red-50 text-red-600 font-bold text-sm rounded-lg hover:bg-red-100 transition border border-red-100 shrink-0"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {filteredComplaints.length === 0 ? <div className="p-10 text-center text-gray-500">No complaints found.</div> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                                    <tr>
                                        <th className="p-4">Student</th>
                                        <th className="p-4">Issue</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {filteredComplaints.map(c => (
                                        <tr 
                                            key={c._id} 
                                            onClick={() => openDetails(c)} 
                                            className="hover:bg-purple-50 transition cursor-pointer group"
                                        >
                                            <td className="p-4">
                                                <p className="font-bold text-gray-800">{c.student?.room}</p>
                                                <p className="text-gray-500 text-xs">{c.student?.name}</p>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedStudent(c.student);
                                                    }}
                                                    className="text-[11px] text-purple-600 font-bold hover:underline mt-1 flex items-center gap-1"
                                                >
                                                    View Profile
                                                </button>
                                            </td>


                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-bold capitalize">{c.category}</span>
                                                    {c.reopenReason && <span className="bg-red-100 text-red-600 px-1.5 rounded text-[10px] font-bold border border-red-200">REOPENED</span>}
                                                </div>
                                                <p className="text-gray-700 line-clamp-1 mt-1 font-medium">{c.title}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                                    c.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                                    c.status === 'assigned' ? 'bg-blue-100 text-blue-700' : 
                                                    c.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button className="text-purple-600 font-bold text-xs hover:underline bg-purple-50 px-3 py-1 rounded-full group-hover:bg-purple-200 transition">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: NOTICE BOARD (1/3 Width) */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Post Notice Form */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">📢 Post New Notice</h3>
                    <form onSubmit={handleNoticeSubmit} className="space-y-3">
                        <input 
                            className="w-full p-2 border rounded text-sm" 
                            placeholder="Notice Title" required 
                            value={noticeForm.title} onChange={e => setNoticeForm({...noticeForm, title: e.target.value})}
                        />
                        <textarea 
                            className="w-full p-2 border rounded text-sm" 
                            placeholder="Details..." rows="3" required
                            value={noticeForm.description} onChange={e => setNoticeForm({...noticeForm, description: e.target.value})}
                        ></textarea>

                        {!noticeForm.previewUrl ? (
                            <input 
                                type="file" accept="image/*" onChange={handleNoticeImage}
                                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-bold file:bg-gray-100 hover:file:bg-gray-200"
                            />
                        ) : (
                            <div className="relative mt-2 inline-block">
                                <img src={noticeForm.previewUrl} alt="Preview" className="h-16 w-full object-cover rounded border border-gray-200" />
                                <button type="button" onClick={() => setNoticeForm({...noticeForm, photoBase64: null, previewUrl: null})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><TrashIcon /></button>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-gray-800 text-white py-2 rounded font-bold text-sm hover:bg-black transition">Post Notice</button>
                    </form>
                </div>

                {/* Existing Notices List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4">Active Notices</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notices.length === 0 ? <p className="text-sm text-gray-400">No notices posted.</p> : 
                        notices.map(n => (
                            <div key={n._id} onClick={() => setSelectedNotice(n)}
                                className="p-3 bg-gray-50 rounded border border-gray-100 group relative cursor-pointer hover:bg-gray-100 transition"
                            >
                                <h4 className="font-bold text-sm text-gray-800">{n.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{n.description}</p>
                                <p className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</p>
                                
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>

      </main>

      {/* --- MODALS --- */}
      
      {/* 1. ASSIGN MODAL */}
      <AssignWorkerModal 
         isOpen={activeModal === 'assign'} 
         onClose={() => setActiveModal(null)} 
         complaint={selectedComplaint} 
         workers={workers} 
         onAssign={assignWorker} 
      />


      {/* 2. MANAGE WORKERS MODAL */}
      <ManageWorkersModal 
         isOpen={activeModal === 'manageWorkers'} 
         onClose={() => setActiveModal(null)} 
         workers={workers}
         onAdd={addWorker} 
         onUpdate={updateWorker}
         onDelete={deleteWorker}
         onToggleAvailability={toggleWorkerAvailability}
      />

      {/* 3. DETAILS MODAL */}
      <CaretakerComplaintDetails 
         isOpen={activeModal === 'details'}
         onClose={() => setActiveModal(null)}
         complaint={selectedComplaint}
         onAssign={openAssignFromDetails} // Clicking assign here opens the assign modal
         onResolve={(id) => { resolveComplaint(id); setActiveModal(null); }}
         onReject={(id, reason) => { rejectComplaint(id, reason); setActiveModal(null); }}
      />

        {/* 4. NOTICE DETAILS MODAL */}
        <NoticeModal 
         isOpen={!!selectedNotice} 
         notice={selectedNotice} 
         onClose={() => setSelectedNotice(null)} 
         onDelete={deleteNotice}
      />

      {/* 5. STUDENT PROFILE MODAL (Add this here) */}
      <StudentProfileModal 
         isOpen={!!selectedStudent} 
         onClose={() => setSelectedStudent(null)} 
         student={selectedStudent} 
      />

    </div>
  );
};

// Sub-component
const StatCard = ({ title, count, color, onClick, isActive }) => (
    <div 
        onClick={onClick}
        className={`p-6 rounded-xl border shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${color} ${
            isActive 
            ? 'ring-2 ring-offset-2 ring-gray-400 scale-105 opacity-100 z-10' 
            : 'opacity-60 hover:opacity-100 hover:-translate-y-1'
        }`}
    >
        <span className="text-3xl font-extrabold mb-1">{count}</span>
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    </div>
);

export default CaretakerDashboard;
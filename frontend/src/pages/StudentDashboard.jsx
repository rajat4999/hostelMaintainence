import { useState } from "react";
import { useStudentData } from "../hooks/useStudentData";
import NoticeModal from "../components/dashboard/NoticeModal";

// --- MODULES ---
import StudentNavbar from "../components/layout/StudentNavbar";
import ComplaintModal from "../components/dashboard/ComplaintModal";
import ProfileModal from "../components/dashboard/ProfileModal";
import ComplaintDetailsModal from "../components/dashboard/ComplaintDetailsModal";

// --- ICONS ---
const ArrowRightIcon = () => <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;

const StudentDashboard = () => {
  const { 
    user, complaints, notices, stats, notifications, loading, 
    logout, fileComplaint, updateProfile, reopenComplaint ,withdrawComplaint
  } = useStudentData();

  // --- STATE ---
  const [activeModal, setActiveModal] = useState(null); 
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [filter, setFilter] = useState('all'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- FILTER LOGIC ---
  // --- FILTER LOGIC ---
  const filteredComplaints = complaints.filter(c => {
      // 1. Status Filter
      const matchesStatus = filter === 'all' ? true : c.status === filter;

      // 2. Search Filter (by Title, Category, ID, or Location)
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = query === '' || 
          (c.title?.toLowerCase().includes(query)) ||
          (c.category?.toLowerCase().includes(query)) ||
          (c.location?.toLowerCase().includes(query)) ||
          (c._id?.toString().toLowerCase().includes(query));

      // 3. Date Range Filter (Bulletproof timezone logic)
      let matchesDate = true;

      if (startDate || endDate) {
          const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
          const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;

          const actionDates = [
              c.createdAt,
              c.updatedAt,
              c.assignAt,
              c.resolvedAt,
              c.reopenedAt
          ]
          .filter(Boolean)
          .map(dateStr => new Date(dateStr).getTime());

          matchesDate = actionDates.some(time => time >= start && time <= end);
      }

      return matchesStatus && matchesSearch && matchesDate;
  });

  // --- INSTANT STATS CALCULATION ---
  const localStats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      assigned: complaints.filter(c => c.status === 'assigned').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      rejected: complaints.filter(c => c.status === 'rejected').length,
  };

  const openDetails = (complaint) => {
      setSelectedComplaint(complaint);
      setActiveModal('details');
  };

  const canReopen = (resolvedDate) => {
    const diffTime = Math.abs(new Date() - new Date(resolvedDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) <= 10;
  };

  const handleWithdraw = async (e, compId) => {
      e.stopPropagation(); 
      if (window.confirm("Are you sure you want to withdraw this complaint? It will be permanently deleted.")) {
          await withdrawComplaint(compId);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      <StudentNavbar 
        user={user} 
        notifications={notifications} 
        onLogout={logout} 
        onOpenProfile={() => setActiveModal('profile')}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-3 space-y-8">
            
            {/* --- INTERACTIVE STATS --- */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                <StatCard 
                    title="Total" 
                    count={localStats.total} 
                    color="blue" 
                    isActive={filter === 'all'} 
                    onClick={() => setFilter('all')} 
                />
                <StatCard 
                    title="Pending" 
                    count={localStats.pending} 
                    color="yellow" 
                    isActive={filter === 'pending'} 
                    onClick={() => setFilter('pending')} 
                />

                <StatCard 
                    title="Assigned" 
                    count={localStats.assigned} 
                    color="cyan" // We will add 'cyan' to your color map in the next step!
                    isActive={filter === 'assigned'} 
                    onClick={() => setFilter('assigned')} 
                />

                <StatCard 
                    title="Resolved" 
                    count={localStats.resolved} 
                    color="green" 
                    isActive={filter === 'resolved'} 
                    onClick={() => setFilter('resolved')} 
                />

                <StatCard 
                    title="Rejected" 
                    count={localStats.rejected} 
                    color="red" 
                    isActive={filter === 'rejected'} 
                    onClick={() => setFilter('rejected')} 
                />
                
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <h2 className="text-2xl font-bold text-gray-800">
                    {filter === 'all' ? 'All Complaints' : filter === 'pending' ? 'Pending Complaints' : 'Resolved Complaints'}
                </h2>
                <button onClick={() => setActiveModal('complaint')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition transform hover:-translate-y-1 shrink-0">
                    + New Complaint
                </button>
            </div>

            {/* --- NEW: COMPLAINTS SEARCH & FILTERS --- */}
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
                                placeholder="Search title, category, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
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
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-600"
                        />
                    </div>

                    {/* Date To */}
                    <div className="w-full md:w-36">
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full py-2 px-3 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-600"
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

            {/* --- COMPLAINT TABLE --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[300px]">
                {filteredComplaints.length === 0 ? (
                    <div className="p-10 text-center flex flex-col items-center justify-center h-full">
                        <p className="text-gray-400 text-lg mb-2">No complaints found in this category.</p>
                        {filter !== 'all' && (
                            <button onClick={() => setFilter('all')} className="text-blue-600 font-bold hover:underline">
                                View All
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                                    <th className="p-4">Title</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredComplaints.map(c => (
                                    <tr 
                                        key={c._id} 
                                        onClick={() => openDetails(c)} 
                                        className="hover:bg-blue-50 cursor-pointer transition duration-150 group animate-fadeIn"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="font-semibold text-gray-800">{c.title}</span>
                                                
                                                {/* NEW: COMMON BADGE */}
                                                {c.isCommon && (
                                                    <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-[10px] font-extrabold border border-orange-200 tracking-wider shrink-0">
                                                        COMMON AREA
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* NEW: Show who reported it (only if it's a common area complaint) */}
                                            {/* --- NEW: LOCATION & REPORTER BLOCK --- */}
                                            {c.isCommon && (
                                                <div className="mt-1">
                                                    <p className="text-xs font-bold text-gray-800 mb-0.5">
                                                        📍 {c.location || "Location Not Specified"}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        Reported by: <span className="font-medium">
                                                            {c.student ? `${c.student.name} (Room ${c.student.room})` : 'Former Student'}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 capitalize text-gray-600">{c.category}</td>
                                        <td className="p-4"><Badge status={c.status} /></td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-3">
                                                {/* NEW: Withdraw Button (Only shows for pending complaints) */}
                                                {c.status === 'pending' && (
                                                    <button 
                                                        onClick={(e) => handleWithdraw(e, c._id)}
                                                        className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 hover:shadow-sm transition z-10"
                                                    >
                                                        Withdraw
                                                    </button>
                                                )}
                                                
                                                {/* EXISTING: Arrow Icon */}
                                                <span className="inline-block p-2 rounded-full group-hover:bg-white group-hover:shadow-sm transition">
                                                    <ArrowRightIcon />
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h3 className="text-lg font-bold mb-4">📢 Notice Board</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {notices.map(n => (
                        <div key={n._id} onClick={() => setSelectedNotice(n)} className="p-3 bg-gray-50 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-100 hover:shadow-md transition group">
                            <h4 className="font-bold text-sm">{n.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{n.description}</p>
                            <p className="text-[10px] text-gray-400 text-right mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))}
                    {notices.length === 0 && <p className="text-sm text-gray-500">No active notices.</p>}
                </div>
            </div>
        </div>
      </main>

      {/* --- MODALS --- */}
      <ComplaintModal isOpen={activeModal === 'complaint'} onClose={() => setActiveModal(null)} onSubmit={fileComplaint} userHostel={user.hostel} />
      <ProfileModal isOpen={activeModal === 'profile'} onClose={() => setActiveModal(null)} user={user} onUpdate={updateProfile} />
      <ComplaintDetailsModal isOpen={activeModal === 'details'} onClose={() => setActiveModal(null)} complaint={selectedComplaint} onReopen={reopenComplaint} />
        <NoticeModal isOpen={!!selectedNotice} notice={selectedNotice} onClose={() => setSelectedNotice(null)} />

    </div>
  );
};

// --- UPDATED STAT CARD ---
// Now accepts `onClick` and `isActive` props
const StatCard = ({ title, count, color, onClick, isActive }) => {
    // Tailwind color mapping
    const colors = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', activeRing: 'ring-blue-400' },
        yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', activeRing: 'ring-yellow-400' },
        green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', activeRing: 'ring-green-400' },
        red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', activeRing: 'ring-red-400' },
        
        // --- ADD THIS NEW COLOR FOR THE ASSIGNED CARD ---
        cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', activeRing: 'ring-cyan-400' }
    };

    const c = colors[color];

    return (
        <button 
            onClick={onClick}
            className={`
                p-6 rounded-xl border flex flex-col items-center justify-center transition-all duration-200 w-full
                ${c.bg} ${c.text} ${c.border}
                ${isActive ? `ring-2 ${c.activeRing} shadow-md scale-105` : 'hover:scale-105 hover:shadow-sm'}
            `}
        >
            <span className="text-4xl font-extrabold mb-1">{count}</span>
            <span className="text-sm font-medium uppercase opacity-80">{title}</span>
        </button>
    );
};

const Badge = ({ status }) => {
    const colors = { resolved: 'bg-green-100 text-green-700', assigned: 'bg-blue-100 text-blue-700', pending: 'bg-yellow-100 text-yellow-700',rejected: 'bg-red-100 text-red-700' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[status] || colors.pending}`}>{status}</span>;
};

export default StudentDashboard;
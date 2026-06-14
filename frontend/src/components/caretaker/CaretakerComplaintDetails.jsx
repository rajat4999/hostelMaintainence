import { useState } from "react";

// Icons
const CheckIcon = () => <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const AlertIcon = () => <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

const CaretakerComplaintDetails = ({ isOpen, onClose, complaint, onAssign, onResolve ,onReject}) => {
    const [rejectReason, setRejectReason] = useState("");
  if (!isOpen || !complaint) return null;

  // --- TIMELINE LOGIC ---
  // --- TIMELINE LOGIC ---
  let steps = [{ id: "pending", label: "Complaint Filed", date: complaint.createdAt }];
  let currentStepIndex = 0;

  if (complaint.status === 'rejected') {
      // If rejected, override the timeline
      steps.push({ 
          id: "rejected", 
          label: "Complaint Rejected", 
          details: <p className="text-sm text-red-600 mt-2 font-medium bg-red-50 p-2 rounded border border-red-100">Reason: {complaint.rejectReason}</p> 
      });
      currentStepIndex = 1;
  } else {
      // Standard Timeline
      steps.push({ 
          id: "assigned", 
          label: "Worker Assigned", 
          date: complaint.assignAt,
          details: complaint.status !== 'pending' && complaint.worker ? (
              <div className="mt-3 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3 w-full">
                  {complaint.worker.image ? (
                      <img src={complaint.worker.image} alt="Worker Profile" className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-sm shrink-0" />
                  ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm border-2 border-blue-300 shrink-0">
                          {complaint.worker.name ? complaint.worker.name.charAt(0).toUpperCase() : 'W'}
                      </div>
                  )}
                  <div>
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Assigned Worker</p>
                      <h4 className="font-bold text-blue-900 text-sm leading-tight">{complaint.worker.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-medium">{complaint.worker.category}</span>
                          <span className="text-[10px] font-bold text-blue-800">📞 {complaint.worker.mobNo}</span>
                      </div>
                  </div>
              </div>
          ) : null
      });
      steps.push({ id: "resolved", label: "Issue Resolved", date: complaint.resolvedAt });
      
      if (complaint.status === 'assigned') currentStepIndex = 1;
      if (complaint.status === 'resolved') currentStepIndex = 2;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        {/* Header */}
<div className="bg-purple-800 p-6 flex justify-between items-center text-white shrink-0">
    <div>
        <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">Complaint Details</h3>
            {complaint.isCommon && (
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase shadow-sm">
                    Common Area
                </span>
            )}
        </div>

        <p className="text-xs text-purple-300 font-mono mt-1">ID: {complaint._id}</p>
        
        <div className="flex items-center gap-2 text-purple-200 text-sm mt-1.5">
            {complaint.isCommon ? (
                <>
                    {/* Show the actual location of the issue */}
                    <span className="font-bold text-white">
                        📍 {complaint.location || "Location Not Specified"}
                    </span>
                    <span className="opacity-50">•</span>
                    <span className="text-xs">Reported by: {complaint.student?.name} (Room {complaint.student?.room})</span>
                </>
            ) : (
                <>
                    {/* Standard personal room issue */}
                    <span>Room: {complaint.student?.room}</span>
                    <span>•</span>
                    <span>{complaint.student?.name}</span>
                </>
            )}
        </div>
    </div>
          <button onClick={onClose} className="text-2xl hover:text-purple-300">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN: INFO & IMAGE */}
            <div className="space-y-6">
                
                {/* 1. REOPEN ALERT (If applicable) */}
                {complaint.reopenReason && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                        <div className="flex items-start gap-3">
                            <AlertIcon />
                            <div>
                                <h4 className="font-bold text-red-800 text-sm uppercase">Reopened Complaint</h4>
                                <p className="text-red-700 text-sm mt-1 font-medium">"{complaint.reopenReason}"</p>
                                {complaint.reopenedAt && <p className="text-red-400 text-xs mt-1">{new Date(complaint.reopenedAt).toLocaleString()}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. DESCRIPTION */}
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Issue Description</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h4 className="font-bold text-gray-800 mb-2">{complaint.title}</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{complaint.description}</p>
                        <span className="inline-block mt-3 bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold capitalize">
                            Category: {complaint.category}
                        </span>
                    </div>
                </div>

                {/* 3. ATTACHED IMAGE */}
                {complaint.image && (
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Attached Proof</p>
                        <div className="relative group">
                            <img 
                                src={complaint.image} 
                                alt="Proof" 
                                className="w-full h-48 object-cover rounded-xl border border-gray-200 shadow-sm" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                                <button 
                                    onClick={() => window.open(complaint.image, '_blank')}
                                    className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition"
                                >
                                    View Full Size
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: TIMELINE & ACTIONS */}
            <div className="space-y-8">
                
                {/* 1. TIMELINE */}
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-4">Status Timeline</p>
                    <div className="relative pl-2 border-l-2 border-gray-200 ml-3 space-y-8">
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            return (
                                <div key={step.id} className="relative pl-6">
                                    {/* Dot */}
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${
                                        isCompleted ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'
                                    }`}></div>
                                    
                                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {step.label}
                                    </h4>
                                    {step.date && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(step.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    )}
                                    {isCompleted && step.details}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. QUICK ACTIONS */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">Actions</p>
                    <div className="space-y-3">
                        
                        {/* Show Assign button ONLY if pending */}
                        {complaint.status === 'pending' && (
                            <button 
                                onClick={() => onAssign(complaint)}
                                className="w-full py-3 bg-purple-700 text-white rounded-lg font-bold shadow-md hover:bg-purple-800 transition flex justify-center items-center gap-2"
                            >
                                <span>👷 Assign Worker</span>
                            </button>
                        )}

                        {/* Show Resolve button ONLY if assigned */}
                        {complaint.status === 'assigned' && (
                            <button 
                                onClick={() => { if(window.confirm("Confirm Resolve?")) onResolve(complaint._id); }}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition flex justify-center items-center gap-2"
                            >
                                <span>✅ Mark as Resolved</span>
                            </button>
                        )}

                        {/* --- THE FIX: Show Reject section if pending OR assigned --- */}
                        {(complaint.status === 'pending' || complaint.status === 'assigned') && (
                            <div className={`border-gray-200 ${complaint.status === 'pending' || complaint.status === 'assigned' ? 'mt-4 border-t pt-4' : ''}`}>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Reject Complaint</p>
                                <textarea
                                    placeholder="Reason for rejection (Required)..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm mb-2 focus:ring-2 focus:ring-red-400 outline-none resize-none bg-white"
                                    rows="2"
                                />
                                <button
                                    onClick={() => {
                                        if (!rejectReason.trim()) return alert("Please enter a reason for rejection.");
                                        if (window.confirm("Are you sure you want to reject this complaint?")) {
                                            onReject(complaint._id, rejectReason);
                                        }
                                    }}
                                    className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-bold shadow-sm hover:bg-red-100 transition"
                                >
                                    ❌ Reject Complaint
                                </button>
                            </div>
                        )}

                        {/* NEW: Rejected Status Display */}
                        {complaint.status === 'rejected' && (
                            <div className="text-left p-3 bg-red-50 rounded-lg border border-red-200">
                                <p className="text-red-800 font-bold text-sm uppercase mb-1">Status: Rejected</p>
                                <p className="text-red-700 text-sm font-medium">"{complaint.rejectReason}"</p>
                            </div>
                        )}
                        {/* {complaint.status === 'assigned' && (
                            <button 
                                onClick={() => { if(window.confirm("Confirm Resolve?")) onResolve(complaint._id); }}
                                className="w-full py-3 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition flex justify-center items-center gap-2"
                            >
                                <span>✅ Mark as Resolved</span>
                            </button>
                        )} */}
                        {complaint.status === 'resolved' && (
                            <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg font-bold text-sm border border-green-200">
                                This complaint is closed.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default CaretakerComplaintDetails;
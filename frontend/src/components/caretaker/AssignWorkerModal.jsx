import { useState } from "react";

const AssignWorkerModal = ({ isOpen, onClose, complaint, workers, onAssign }) => {
  const [selectedWorker, setSelectedWorker] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  // Filter workers to match the complaint category (Optional but good UX)
  const relevantWorkers = workers.filter(w => 
    w.isAvailable !== false &&
    (!complaint?.category || w.category.toLowerCase() === complaint.category.toLowerCase())
  );
  
  // If no relevant workers found, show all (fallback)
  const workerList = relevantWorkers ;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onAssign(complaint._id, selectedWorker);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden">
        <div className="bg-purple-700 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold">Assign Worker</h3>
          <button onClick={onClose} className="text-xl hover:text-gray-200">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
             <p className="text-xs font-bold text-gray-500 uppercase">Complaint</p>
             <p className="font-bold text-gray-800">{complaint.title}</p>
             <p className="text-sm text-gray-600 capitalize">Category: {complaint.category}</p>
          </div>

          <div>
             <label className="text-sm font-bold text-gray-600">Select Worker</label>
             <select 
                className="w-full p-3 border rounded-lg mt-1"
                required
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
             >
                <option value="">-- Choose a Worker --</option>
                {workerList.map(w => (
                    <option key={w._id} value={w._id}>
                        {w.name} ({w.category}) - {w.mobNo}
                    </option>
                ))}
             </select>
             {workerList.length === 0 && (
                 <p className="text-xs text-red-500 mt-1">No workers found for this category.</p>
             )}
          </div>

          <div className="flex gap-3 pt-2">
             <button type="button" onClick={onClose} className="w-1/3 py-2 bg-gray-200 rounded-lg font-bold text-gray-600">Cancel</button>
             <button type="submit" disabled={isSubmitting || !selectedWorker} className="w-2/3 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-800 disabled:bg-gray-400">
                {isSubmitting ? "Assigning..." : "Confirm Assignment"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignWorkerModal;
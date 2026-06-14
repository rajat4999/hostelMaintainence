import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// Icons
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const SearchIcon = () => <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

// --- CHANGE 1: Added onToggleAvailability to props ---
const ManageWorkersModal = ({ isOpen, onClose, workers, onAdd, onUpdate, onDelete, onToggleAvailability }) => {
  // 'list' or 'form'
  const [view, setView] = useState('list'); 
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", mobNo: "", category: "electrical", photoBase64: null, previewUrl: null });
  const [searchQuery, setSearchQuery] = useState("");

  // Reset view when modal opens
  useEffect(() => {
      if (isOpen) {
        setView('list');
        setSearchQuery("");
    }

  }, [isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB allowed");
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setFormData({ ...formData, photoBase64: reader.result, previewUrl: reader.result });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
        await onUpdate(editingId, formData);
    } else {
        await onAdd(formData);
    }
    setView('list'); // Go back to list after save
  };

  const openAddForm = () => {
      setEditingId(null);
      setFormData({ name: "", mobNo: "", category: "electrical", photoBase64: null, previewUrl: null });
      setView('form');
  };

  const openEditForm = (worker) => {
      setEditingId(worker._id);
      setFormData({ name: worker.name, mobNo: worker.mobNo, category: worker.category, photoBase64: null, previewUrl: worker.image || null });
      setView('form');
  };

  const filteredWorkers = workers.filter(w => 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-purple-800 p-5 flex justify-between items-center text-white shrink-0">
          <h3 className="font-bold text-lg">
              {view === 'list' ? 'Manage Workers' : editingId ? 'Edit Worker' : 'Add New Worker'}
          </h3>
          <button onClick={onClose} className="text-2xl hover:text-purple-200 transition">&times;</button>
        </div>

        {/* --- LIST VIEW --- */}
        {view === 'list' && (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center shrink-0 bg-gray-50">
                    {/* The Search Input */}
                    <div className="relative w-full sm:w-1/2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-medium text-gray-700"
                        />
                    </div>
                    
                    <button onClick={openAddForm} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition shadow-sm w-full sm:w-auto justify-center">
                        <PlusIcon /> Add New Worker
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto custom-scrollbar space-y-3 flex-1">
                    {filteredWorkers.length === 0 ? <p className="text-center text-gray-500 py-10">No workers found.</p> : 
                    filteredWorkers.map(w => (
                        // --- CHANGE 2: Upgraded worker card with toggle switch ---
                        <div key={w._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition gap-4">
                            
                            {/* Profile & Info */}
                            <div className="flex items-center gap-4">
                                {w.image ? (
                                    <img src={w.image} alt={w.name} className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 shrink-0" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg border-2 border-purple-200 shrink-0">
                                        {w.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-800 leading-none">{w.name}</h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">{w.category}</span>
                                        <span className="text-xs text-gray-500 font-mono font-medium">📞 {w.mobNo}</span>
                                    </div>
                                    {/* Show Active Task Count */}
                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                                        {w.activeTaskCount || 0} Active Tasks
                                    </p>
                                </div>
                            </div>

                            {/* Actions Container */}
                            <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 mt-2 sm:mt-0">
                                
                                {/* THE iOS TOGGLE SWITCH */}
                                <label className="relative inline-flex items-center cursor-pointer mr-2">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={w.isAvailable !== false} // Defaults to true if undefined
                                        onChange={() => onToggleAvailability(w._id, w.isAvailable !== false)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className={`ml-2 text-[10px] font-bold uppercase w-12 ${w.isAvailable !== false ? 'text-green-600' : 'text-gray-400'}`}>
                                        {w.isAvailable !== false ? 'Duty' : 'Off'}
                                    </span>
                                </label>

                                {/* Existing Edit/Delete Buttons */}
                                <div className="flex gap-2">
                                    <button onClick={() => openEditForm(w)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="Edit">
                                        <EditIcon />
                                    </button>
                                    <button onClick={() => { if(window.confirm(`Delete ${w.name}?`)) onDelete(w._id); }} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition" title="Delete">
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- FORM VIEW (ADD/EDIT) --- */}
        {view === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                        <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mobile No</label>
                        <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none" required value={formData.mobNo} onChange={e => setFormData({...formData, mobNo: e.target.value})} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-400 outline-none bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option value="electrical">Electrical</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="cleaning">Cleaning</option>
                        <option value="furniture">Furniture</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 block">Worker Photo</label>
                    <div className="flex items-center gap-4 mt-2">
                        {formData.previewUrl && (
                            <img src={formData.previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-full border-2 border-purple-200 shrink-0" />
                        )}
                        <div className="flex-1">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 transition" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-6">
                    <button type="button" onClick={() => setView('list')} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition">Cancel</button>
                    <button type="submit" className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition">
                        {editingId ? 'Save Changes' : 'Add Worker'}
                    </button>
                </div>
            </form>
        )}

      </div>
    </div>
  );
};

export default ManageWorkersModal;
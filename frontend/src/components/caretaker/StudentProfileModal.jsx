import React from 'react';

const StudentProfileModal = ({ isOpen, onClose, student }) => {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative">
        
        {/* Header Background */}
        <div className="bg-[#3b5bdb] h-24 w-full relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200 transition text-3xl">
                &times;
            </button>
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 pt-0 relative flex flex-col items-center">
            
            {/* Avatar Circle (Overlaps the header) */}
            <div className="w-20 h-20 bg-gray-100 rounded-full border-4 border-white shadow-md flex items-center justify-center -mt-10 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-800">{student.name}</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mt-2 uppercase tracking-wide">
                {student.hostel}
            </span>

            <div className="w-full mt-6 space-y-4">

                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-semibold text-gray-500 uppercase">Reg No.</span>
                  <span className="text-lg font-bold text-gray-800 uppercase">{student.regNo || 'N/A'}</span>
              </div>

                {/* NEW: Email Address */}
                <div className="flex justify-between items-center border-b pb-2 gap-4">
                    <span className="text-sm font-semibold text-gray-500 uppercase">Email</span>
                    <span className="text-sm font-bold text-gray-800 truncate">{student.email || 'N/A'}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm font-semibold text-gray-500 uppercase">Room No.</span>
                    <span className="text-lg font-bold text-gray-800">{student.room}</span>
                </div>
                
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-sm font-semibold text-gray-500 uppercase">Mobile</span>
                    <span className="text-lg font-bold text-gray-800">{student.mobNo}</span>
                </div>

                {/* Quick Action Button */}
                <a 
                    href={`tel:${student.mobNo}`}
                    className="w-full block text-center bg-[#539b55] text-white font-bold py-3 rounded-xl hover:bg-[#407a42] transition shadow-md mt-4"
                >
                    Call Student
                </a>
            </div>
        </div>

      </div>
    </div>
  );
};

export default StudentProfileModal;
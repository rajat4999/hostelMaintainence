import { useState, useRef, useEffect } from "react";

// Icons
const BellIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>;

const StudentNavbar = ({ user, notifications, onLogout, onOpenProfile }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  
  const notifRef = useRef();
  const userRef = useRef();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20">
      <h1 className="text-2xl font-extrabold text-blue-700 tracking-tight">Samadhan Setu </h1>
      <h3 className="text-2xl font-extrabold text-blue-700 tracking-tight">Student Panel </h3>
      
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(!showNotif)} className="relative text-gray-600 hover:text-blue-600 transition p-2">
            <BellIcon />
            {notifications.length > 0 && <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border border-white"></span>}
          </button>
          
          {showNotif && (
            <div className="absolute right-0 mt-3 w-80 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
               <div className="bg-gray-50 px-4 py-3 border-b font-semibold text-gray-700">Notifications</div>
               <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? <div className="p-4 text-center text-gray-400 text-sm">No new updates</div> : 
                  notifications.map(n => <div key={n.id} className="p-4 border-b hover:bg-gray-50"><p className="text-sm font-medium">{n.text}</p><p className="text-xs text-gray-400">{n.time}</p></div>)}
               </div>
            </div>
          )}
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={userRef}>
           <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
              <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-gray-800 leading-none">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.hostel}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg border border-blue-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : "S"}
              </div>
           </button>

           {showUser && (
              <div className="absolute right-0 mt-3 w-56 bg-white shadow-xl rounded-xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
                  <div className="p-4 border-b bg-gray-50">
                      <p className="text-xs text-gray-500 uppercase font-bold">Signed in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                      <button onClick={() => { onOpenProfile(); setShowUser(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition flex items-center gap-2">
                          <UserIcon /> Edit Profile
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2">
                          <LogoutIcon /> Logout
                      </button>
                  </div>
              </div>
           )}
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
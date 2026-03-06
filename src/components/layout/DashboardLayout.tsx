import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Wallet, ArrowLeftRight, LogOut, User, Menu, Plus } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
];



export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };


  const getFabAction = () => {
  switch (location.pathname) {
    case "/accounts":
      return () => navigate("/accounts/create");

    case "/transactions":
      return () => navigate("/transactions/create");

    case "/dashboard":
      return () => navigate("/transactions/create");

    default:
      return null;
  }
};
  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        const profileMenu = document.getElementById('profile-menu');
        const profileButton = document.getElementById('profile-button');
        if (profileMenu && !profileMenu.contains(event.target as Node) && 
            profileButton && !profileButton.contains(event.target as Node)) {
          setShowProfileMenu(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const fabAction = getFabAction();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F]">
      {/* Main Content Area - With bottom padding for navigation */}
      <div className="pb-24 min-h-screen">
        {/* Top Bar - Minimal for mobile */}
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-[#0F1A2F]/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">FinVault</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Financial Dashboard</p>
              </div>
            </div>

            {/* Profile Button */}
            <div className="relative">
              <button
                id="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div 
                  id="profile-menu"
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#0F1A2F] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email || ""}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-4 py-4">
          <Outlet />
        </main>
      </div>

      {/* Floating Bottom Navigation - No bar, just icons */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none flex justify-center items-end pb-6 z-50">
        <div className="bg-white/90 dark:bg-[#0F1A2F]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-gray-200/50 dark:border-gray-800/50 px-4 py-3 pointer-events-auto">
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center transition-all duration-300 group ${
                      isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-600/30 -translate-y-1' 
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      }`}>
                        <Icon className={`h-5 w-5 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                        
                        {/* Active Indicator Dot */}
                        {isActive && (
                          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                      </div>
                      <span className={`text-[11px] font-medium mt-1.5 transition-all duration-300 ${
                        isActive 
                          ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                          : 'text-gray-500 dark:text-gray-500'
                      }`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Action FAB (Optional - can be removed if not needed) */}
      <button className="fixed right-4 bottom-24 w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-110 active:scale-95 z-50">
        <Plus className="h-5 w-5" />
      </button>

      {/* Safe Area for iOS devices */}
      <style>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .fixed.bottom-0 {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </div>
  );
}
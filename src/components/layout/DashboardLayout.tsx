// layouts/DashboardLayout.tsx
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { LayoutDashboard, Wallet, ArrowLeftRight, LogOut, TargetIcon, Bot } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { ChatProvider } from "@/features/chat/context/ChatContext";

function PageSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-pulse space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-muted rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-muted rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-muted rounded-xl"></div>
      </div>
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-card border border-border rounded-xl"></div>
        ))}
      </div>
      <div className="h-64 bg-card border border-border rounded-xl mt-6 w-full"></div>
    </div>
  );
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/accounts", label: "Accounts", icon: Wallet },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: TargetIcon },
];

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const isChatPage = location.pathname === "/chat";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu) {
        const profileMenu = document.getElementById("profile-menu");
        const profileButton = document.getElementById("profile-button");
        if (
          profileMenu && !profileMenu.contains(event.target as Node) &&
          profileButton && !profileButton.contains(event.target as Node)
        ) {
          setShowProfileMenu(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pb-24 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-lg">F</span>
              </div>
              <div>
                <span className="text-lg font-bold text-foreground">FinVault</span>
                <p className="text-xs text-muted-foreground">Financial Dashboard</p>
              </div>
            </div>

            <div className="relative">
              <button
                id="profile-button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center border-2 border-border shadow-md hover:shadow-lg transition-shadow"
              >
                <span className="text-sm font-semibold text-foreground">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </button>

              {showProfileMenu && (
                <div
                  id="profile-menu"
                  className="absolute right-0 mt-2 w-64 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="p-4 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{user?.email || ""}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-4 min-h-[calc(100vh-140px)]">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none flex justify-center items-end pb-6 z-50">
        <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-border px-4 py-3 pointer-events-auto">
          <div className="flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center transition-all duration-300 group ${
                      isActive ? "scale-110" : "opacity-70 hover:opacity-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-lg -translate-y-1"
                          : "bg-muted group-hover:bg-accent text-muted-foreground"
                      }`}>
                        <Icon className="h-5 w-5" />
                        {isActive && (
                          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                        )}
                      </div>
                      <span className={`text-[11px] font-medium mt-1.5 transition-all duration-300 ${
                        isActive
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
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

      {/* AI Chat FAB */}
      <button
        onClick={() => isChatPage ? navigate(-1) : navigate("/chat")}
        className={`fixed right-4 bottom-24 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-primary-foreground transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${
          isChatPage
            ? "bg-primary"
            : "bg-primary hover:bg-primary/90"
        }`}
        title={isChatPage ? "Go back" : "Chat with AI"}
      >
        <Bot className="h-5 w-5" />
        {!isChatPage && (
          <span className="absolute inset-0 rounded-2xl bg-primary opacity-30 animate-ping" />
        )}
      </button>

      <style>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .fixed.bottom-0 { padding-bottom: env(safe-area-inset-bottom); }
        }
      `}</style>
    </div>
  );
}

// Wrap the entire layout with ChatProvider so messages survive page navigation
export function DashboardLayout() {
  return (
    <ChatProvider>
      <Layout />
    </ChatProvider>
  );
}
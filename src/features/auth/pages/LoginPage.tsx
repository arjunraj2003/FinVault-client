import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/use-auth";
import { LoginForm } from "../components/LoginForm";
import loginBg from "@/assets/login-bg.jpg";
import { Shield, TrendingUp, Wallet } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    { icon: Shield, text: "Bank-grade security" },
    { icon: TrendingUp, text: "Smart insights" },
    { icon: Wallet, text: "Multi-currency" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1426]">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left: Branding - Hidden on mobile, visible on desktop */}
        <div className="hidden lg:flex lg:w-2/5 relative bg-[#0B1426]">
          <div className="absolute inset-0">
            <img
              src={loginBg}
              alt=""
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1426] via-[#0B1426]/80 to-transparent" />
          </div>
          
          <div className="relative z-10 flex flex-col justify-end p-12">
            <div className="mb-6">
              <span className="text-4xl font-light text-white tracking-tight">Fin</span>
              <span className="text-4xl font-bold text-white tracking-tight">Vault</span>
            </div>
            
            <h2 className="text-3xl font-light text-white mb-3 leading-tight">
              Financial intelligence
              <br />
              <span className="font-semibold">for modern business</span>
            </h2>
            
            <p className="text-gray-400 text-sm max-w-md mb-8">
              Complete control over your finances with real-time insights and intelligent automation.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#2962EF]" />
                    </div>
                    <span className="text-sm text-gray-300">{feature.text}</span>
                  </div>
                );
              })}
            </div>

            {/* Company stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              <div>
                <div className="text-xl font-semibold text-white">€2.5B+</div>
                <div className="text-xs text-gray-500">Assets tracked</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-white">500K+</div>
                <div className="text-xs text-gray-500">Active users</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-white">99.9%</div>
                <div className="text-xs text-gray-500">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form - Full width on mobile */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo - Only visible on mobile, properly centered */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-block">
                <span className="text-3xl font-light text-[#0B1426] dark:text-white tracking-tight">Fin</span>
                <span className="text-3xl font-bold text-[#0B1426] dark:text-white tracking-tight">Vault</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-[#0F1A2F] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold text-[#0B1426] dark:text-white mb-1">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Login Form - Original component preserved */}
              <LoginForm />

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-[#0F1A2F] text-gray-400">secure access</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4 justify-center text-xs">
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Shield className="w-3.5 h-3.5" />
                  <span>256-bit encrypted</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <span>2FA ready</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  <span>GDPR compliant</span>
                </div>
              </div>
            </div>

            {/* Footer links */}
            <div className="flex justify-center gap-4 mt-8 text-xs text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-[#2962EF] transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-[#2962EF] transition-colors">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-[#2962EF] transition-colors">Security</a>
            </div>

            {/* Need help link */}
            <p className="text-center mt-4 text-xs text-gray-400">
              Need help? <a href="#" className="text-[#2962EF] hover:underline">Contact support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
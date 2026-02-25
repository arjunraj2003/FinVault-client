import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { setAccessToken, getAccessToken } from "@/lib/axios";
import { AuthApi } from "../api/auth-api";
import type { AuthContextType, LoginDto, User } from "../types";
import { useToast } from "@/hooks/use-toast";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const USER_STORAGE_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    // Try to refresh the token if we have a stored user
    const refreshToken = async () => {
      // If we have a stored user, try to refresh the token
      if (user) {
        try {
          const { data } = await AuthApi.refresh();
          // Only set the new access token
          setAccessToken(data.data.accessToken);
          // Keep the existing user data from localStorage
          // No need to update user state as user details didn't change
          console.log("Token refreshed successfully");
        } catch (error) {
          // If refresh fails, clear everything
          console.error("Token refresh failed:", error);
          setAccessToken(null);
          setUser(null);
          localStorage.removeItem(USER_STORAGE_KEY);
        }
      } else {
        // No stored user, ensure token is cleared
        setAccessToken(null);
      }
      setIsLoading(false);
    };

    refreshToken();
  }, []); // Empty dependency array - only run once on mount

  const login = useCallback(async (data: LoginDto) => {
    try {
      const response = await AuthApi.login(data);
      console.log("Login response:", response);
      
      const { accessToken, user: userData } = response.data.data;
      
      // Set token in axios instance
      setAccessToken(accessToken);
      
      // Set user in state (this will automatically save to localStorage via useEffect)
      setUser(userData);
      
      toast({ 
        title: "Welcome back!", 
        description: `Logged in as ${userData.email}` 
      });
      
    } catch (error) {
      console.error("Login error:", error);
      toast({ 
        title: "Login failed", 
        description: "Please check your credentials.", 
        variant: "destructive" 
      });
      throw error;
    }
  }, [toast]);

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
    } catch (error) {
      console.error("Logout API error:", error);
      // Continue with logout even if API fails
    } finally {
      // Clear everything
      setAccessToken(null);
      setUser(null);
      // localStorage is cleared automatically by the useEffect above
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    }
  }, [toast]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, ...userData };
      return updatedUser;
    });
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
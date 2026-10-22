import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AxiosError } from "axios";
import { setAccessToken, getAccessToken } from "@/lib/axios";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { AuthApi } from "../api/auth-api";
import type { AuthContextType, LoginDto, RegisterDto, User } from "../types";
import { useToast } from "@/hooks/use-toast";
import type { ApiErrorResponse } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import {
  clearStoredPasskeyId,
  getStoredPasskeyId,
  hasStoredPasskey,
  isPasskeyCancelled,
  platformAuthenticatorAvailable,
  setStoredPasskeyId,
} from "../passkey";

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
  const [offerFingerprint, setOfferFingerprint] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const { toast } = useToast();

  const maybeOfferFingerprint = useCallback(() => {
    if (hasStoredPasskey()) return;
    void platformAuthenticatorAvailable().then((available) => {
      if (available && !hasStoredPasskey()) setOfferFingerprint(true);
    });
  }, []);

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
      maybeOfferFingerprint();
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      const message =
        apiError.response?.data?.message ||
        (apiError.request ? "Could not reach the API server. Check that the backend is running on port 3000." : "Login failed.");
      console.error("Login error:", error);
      toast({ 
        title: "Login failed", 
        description: message,
        variant: "destructive" 
      });
      throw error;
    }
  }, [maybeOfferFingerprint, toast]);

  const register = useCallback(async (data: RegisterDto) => {
    try {
      const response = await AuthApi.register(data);
      const { accessToken, user: userData } = response.data.data;
      setAccessToken(accessToken);
      setUser(userData);
      toast({
        title: "Account created",
        description: `Signed in as ${userData.email}`,
      });
      maybeOfferFingerprint();
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      const message =
        apiError.response?.data?.message ||
        (apiError.request ? "Could not reach the API server. Check that the backend is running on port 3000." : "Registration failed.");
      toast({
        title: "Could not create account",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }, [maybeOfferFingerprint, toast]);

  const unlockWithFingerprint = useCallback(async () => {
    try {
      const options = await AuthApi.passkeyLoginOptions(getStoredPasskeyId());
      const assertion = await startAuthentication({ optionsJSON: options.data.data });
      const response = await AuthApi.passkeyLoginVerify(assertion);
      const { accessToken, user: userData } = response.data.data;
      setAccessToken(accessToken);
      setUser(userData);
      toast({
        title: "Welcome back",
        description: `Unlocked as ${userData.email}`,
      });
    } catch (error) {
      if (isPasskeyCancelled(error)) {
        toast({
          title: "Fingerprint cancelled",
          description: "You can sign in with your email instead.",
        });
        throw error;
      }
      const apiError = error as AxiosError<ApiErrorResponse>;
      if (apiError.response?.data?.message?.toLowerCase().includes("not registered")) {
        clearStoredPasskeyId();
      }
      const message = apiError.response?.data?.message || "Fingerprint unlock failed.";
      toast({
        title: "Could not unlock",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const enrollFingerprint = useCallback(async () => {
    const options = await AuthApi.passkeyRegisterOptions();
    const attestation = await startRegistration({ optionsJSON: options.data.data });
    const verified = await AuthApi.passkeyRegisterVerify(attestation);
    setStoredPasskeyId(verified.data.data.credentialId);
  }, []);

  const disableFingerprint = useCallback(async () => {
    const credentialId = getStoredPasskeyId();
    try {
      if (credentialId) {
        await AuthApi.passkeyRemove(credentialId);
      }
      clearStoredPasskeyId();
      toast({
        title: "Fingerprint turned off",
        description: "This phone will ask for your email and password next time.",
      });
    } catch (error) {
      const apiError = error as AxiosError<ApiErrorResponse>;
      toast({
        title: "Could not turn off fingerprint",
        description: apiError.response?.data?.message || "Try again.",
        variant: "destructive",
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
    register,
    unlockWithFingerprint,
    enrollFingerprint,
    disableFingerprint,
    logout,
  };

  const dismissFingerprintOffer = () => {
    if (enrolling) return;
    setOfferFingerprint(false);
  };

  const turnOnFingerprint = async () => {
    setEnrolling(true);
    try {
      await enrollFingerprint();
      toast({
        title: "Fingerprint is on",
        description: "Next time, unlock FinVault with your fingerprint.",
      });
      setOfferFingerprint(false);
    } catch (error) {
      if (isPasskeyCancelled(error)) return;
      toast({
        title: "Fingerprint was not saved",
        description: "You can still sign in with your password.",
        variant: "destructive",
      });
      setOfferFingerprint(false);
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <Dialog open={offerFingerprint} onOpenChange={(open) => { if (!open) dismissFingerprintOffer(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use fingerprint next time?</DialogTitle>
            <DialogDescription>
              Opening FinVault on this phone can ask for your fingerprint instead of your password. Your password still works.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={dismissFingerprintOffer} disabled={enrolling}>
              Not now
            </Button>
            <Button type="button" onClick={turnOnFingerprint} disabled={enrolling}>
              {enrolling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Use fingerprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

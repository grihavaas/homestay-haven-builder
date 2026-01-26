"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getCurrentUser, getMembership, type Membership } from "@/lib/authz-client";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  membership: Membership | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const userMembership = await getMembership(currentUser.id);
        setMembership(userMembership);
      } else {
        setMembership(null);
      }
    } catch (error) {
      // Ignore abort errors - they're usually from React Strict Mode or navigation
      if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('aborted'))) {
        console.log("Auth refresh aborted (likely due to navigation)");
        return;
      }
      console.error("Error refreshing auth:", error);
      setUser(null);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        if (isMounted) {
          await refresh();
        }

        if (!isMounted) return;

        // Listen for auth changes using singleton client
        const supabase = createSupabaseBrowserClient();
        const {
          data: { subscription: authSubscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;

          try {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              if (!isMounted) return;
              setLoading(true);
              // Small delay to ensure session is fully established
              await new Promise(resolve => setTimeout(resolve, 50));
              if (isMounted) {
                await refresh();
              }
            } else if (event === "SIGNED_OUT") {
              if (isMounted) {
                setUser(null);
                setMembership(null);
                setLoading(false);
              }
            }
          } catch (error) {
            // Ignore abort errors - they're usually from navigation or unmounting
            if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('aborted'))) {
              console.log("Auth state change aborted (likely due to navigation)");
              return;
            }
            console.error("Error in auth state change:", error);
          }
        });
        
        subscription = authSubscription;
      } catch (error) {
        // Ignore abort errors during initialization
        if (error instanceof Error && (error.name === 'AbortError' || error.message?.includes('aborted'))) {
          console.log("Auth init aborted (likely due to navigation)");
          return;
        }
        console.error("Error initializing auth:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, membership, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

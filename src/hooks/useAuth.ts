import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/lib/toastUtils";

export const useAuth = () => {
  // FASE 4: Mode ?mockauth=1 - Mock Auth Provider sense Supabase
  const mockAuthMode = new URLSearchParams(window.location.search).get('mockauth') === '1';
  
  if (mockAuthMode) {
    console.log('🧪 MOCK AUTH MODE: Returning fake user without Supabase');
    return {
      user: { 
        id: 'mock-user-123', 
        email: 'mock@test.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString()
      } as User,
      session: { 
        user: { 
          id: 'mock-user-123',
          email: 'mock@test.com' 
        },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh'
      } as any as Session,
      loading: false,
      signUp: async () => {
        console.log('🧪 Mock signUp called');
      },
      signIn: async () => {
        console.log('🧪 Mock signIn called');
      },
      signOut: async () => {
        console.log('🧪 Mock signOut called');
        window.location.href = '/';
      },
    };
  }
  
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Compte creat!",
        description: "Revisa el teu correu per confirmar el compte",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Benvingut!",
        description: "Has iniciat sessió correctament",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Sessió tancada",
        description: "Fins aviat!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };
};
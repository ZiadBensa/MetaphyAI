import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export function useSessionClear() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear NextAuth session tokens
      localStorage.removeItem('next-auth.session-token');
      localStorage.removeItem('next-auth.csrf-token');
      localStorage.removeItem('next-auth.callback-url');
      localStorage.removeItem('next-auth.state');
      
      // Clear admin session
      document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Clear any other session-related storage
      sessionStorage.clear();
      
      // Force redirect to landing if there's an existing session
      if (session) {
        router.push('/landing');
      }
    }
  }, [session, router]);
}

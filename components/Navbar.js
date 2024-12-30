// components/Navbar.js
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@lib/supabase';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for real-time auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session); // Update authentication state in real time
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-2xl font-bold">Quiz Maker</span>
          <div className="space-x-4 flex items-center">
            <span className="text-gray-300 text-lg">Loading...</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold hover:text-gray-200">
          Quiz Maker
        </Link>
        <div className="space-x-4 flex items-center">
          <Link href="/" className="hover:text-gray-200 text-lg">
            Home
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

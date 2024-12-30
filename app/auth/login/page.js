'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@lib/supabase';
import { useLanguage } from 'context/LanguageContext'; // Import language context

export default function Login() {
  const { t } = useLanguage(); // Use the global language context

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // For toggling password visibility
  const [modalOpen, setModalOpen] = useState(false); // For modal visibility
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('../dashboard'); // Redirect to dashboard if session exists
      }
    };

    checkSession();
  }, [router]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      email: '',
      password: '',
    });

    let isValid = true;

    // Validate email
    if (!formData.email.includes('@')) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: t.emailInvalid || 'Please enter a valid email',
      }));
      isValid = false;
    }

    // Validate password
    if (formData.password.length < 8) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: t.passwordTooShort || 'Password must be at least 8 characters',
      }));
      isValid = false;
    }

    if (isValid) {
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: error.message || t.loginFailed || 'Login failed',
          }));
        } else if (data.session) {
          // Show modal and redirect to dashboard
          setModalOpen(true);
          setTimeout(() => {
            router.push('../dashboard');
          }, 2000); // Adjust the modal duration as needed
        }
      } catch (error) {
        console.error('Error during login:', error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: t.genericError || 'An error occurred. Please try again later.',
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div dir={t.currentLang === 'ar' ? 'rtl' : 'ltr'} className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-6">{t.login || 'Login'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.email || 'Email'}
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder={t.enterEmail || 'Enter your email'}
            />
            {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.password || 'Password'}
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={t.enterPassword || 'Enter your password'}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-3 right-3 text-gray-600"
              >
                {passwordVisible ? t.hide || 'Hide' : t.show || 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? t.loggingIn || 'Logging in...' : t.login || 'Login'}
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {t.noAccount || "Don't have an account?"}{' '}
            <Link href="./register" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t.registerHere || 'Register here'}
            </Link>
          </p>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm">
            <h3 className="text-xl font-semibold text-center">{t.loginSuccess || 'Login Successful'}</h3>
            <p className="text-center text-gray-600 mt-4">{t.redirectingDashboard || 'Redirecting to your dashboard...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from 'context/LanguageContext';

export default function Register() {
  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for form fields and errors
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);

  const router = useRouter();
  const { t } = useLanguage(); // Use the language context

  // Set `isClient` to true on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Toggle password visibility
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({
      email: '',
      password: '',
      confirmPassword: ''
    });

    let isValid = true;

    // Validate email
    if (!formData.email.includes('@')) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: t.emailError || 'Email must contain "@"'
      }));
      isValid = false;
    }

    // Validate password
    if (formData.password.length < 8 || !/\d/.test(formData.password)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: t.passwordError || 'Password must be at least 8 characters and contain at least one number'
      }));
      isValid = false;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: t.confirmPasswordError || 'Passwords do not match'
      }));
      isValid = false;
    }

    // If no errors, proceed with form submission
    if (isValid) {
      setLoading(true);
      try {
        const response = await fetch('../api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json(); // Parse JSON response

        if (response.ok) {
          console.log('User registered successfully:', data);

          // Show the modal and set a timer to redirect
          setModalVisible(true);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        } else {
          setErrors((prevErrors) => ({
            ...prevErrors,
            email: data.message || t.registrationFailed || 'Registration failed',
          }));
        }
      } catch (error) {
        console.error('Error during registration:', error);
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: t.errorOccurred || 'An error occurred. Please try again later.',
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value
    }));
  };

  if (!isClient) return null; // Avoid rendering the form during SSR

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-blue-600 mb-6">{t.createAccount || 'Create an Account'}</h2>
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
              placeholder={t.emailPlaceholder || 'Enter your email'}
            />
            {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.password || 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={t.passwordPlaceholder || 'Enter your password'}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? t.hide || 'Hide' : t.show || 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-2">{errors.password}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-700 mb-2">
              {t.confirmPassword || 'Confirm Password'}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder={t.confirmPasswordPlaceholder || 'Confirm your password'}
              />
              <button
                type="button"
                onClick={toggleConfirmPassword}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? t.hide || 'Hide' : t.show || 'Show'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="flex items-center justify-between mb-6">
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? t.registering || 'Registering...' : t.register || 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {t.alreadyHaveAccount || 'Already have an account?'}{' '}
            <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              {t.loginHere || 'Login here'}
            </Link>
          </p>
        </div>

        {/* Modal for successful registration */}
        {modalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg text-center shadow-lg w-80">
              <h3 className="text-xl font-semibold mb-4">{t.registrationSuccess || 'Registration Successful'}</h3>
              <p className="text-sm text-gray-600 mb-4">{t.checkEmail || 'Please check your email and confirm your registration.'}</p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t.goToLogin || 'Go to Login'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

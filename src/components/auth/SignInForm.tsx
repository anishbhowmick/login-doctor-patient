import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validatePassword } from '../../utils/validation';
import PasswordStrength from './PasswordStrength';
import RoleSelector from './RoleSelector';
import { useAuth } from '../../contexts/AuthContext';

export default function SignInForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', role: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    const newErrors = {
      email: validateEmail(email) ? '' : 'Please enter a valid email address',
      password: validatePassword(password) ? '' : 'Password must be at least 8 characters',
      role: role ? '' : 'Please select a role'
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error)) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(email, password, role);
      if (response.success) {
        const { user } = response.data;

        // Redirect based on role
        if (user.role === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (user.role === 'patient') {
          navigate('/patient-dashboard');
        }
      } else {
        setErrors({
          ...newErrors,
          email: response.message || 'Invalid credentials',
        });
      }
    } catch (error) {
      setErrors({
        ...newErrors,
        email: 'Invalid credentials',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    return role === 'doctor' ? 'doctor@healthconnect.com' : 'patient@example.com';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RoleSelector value={role} onChange={setRole} error={errors.role} />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder={getPlaceholder()}
          required
          aria-describedby="email-error"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600" id="email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            aria-describedby="password-error"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        </div>
        {password && <PasswordStrength password={password} />}
        {errors.password && (
          <p className="mt-1 text-sm text-red-600" id="password-error">
            {errors.password}
          </p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="remember"
          type="checkbox"
          checked={rememberDevice}
          onChange={(e) => setRememberDevice(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
          Remember this device
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-gradient-to-r from-[#4A90E2] to-[#8E44AD] py-3 text-white font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Signing in...
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      <div className="space-y-2 text-center text-sm">
        <a href="#" className="block text-blue-600 hover:text-blue-500">
          Forgot Password?
        </a>
        <a href="#" className="block text-blue-600 hover:text-blue-500">
          New User Registration
        </a>
        <a href="#" className="block text-blue-600 hover:text-blue-500">
          Help Center
        </a>
      </div>
    </form>
  );
}
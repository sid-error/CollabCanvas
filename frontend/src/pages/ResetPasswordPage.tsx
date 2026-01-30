import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, Key } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PasswordStrengthMeter } from '../components/ui/PasswordStrengthMeter';
import { validateResetToken, resetPassword } from '../services/passwordResetService';

/**
 * ResetPasswordPage component
 * Allows users to reset their password using a reset token
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  
  const token = searchParams.get('token');

  // Check token validity on mount
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenChecked(true);
        setError('No reset token provided.');
        return;
      }
      
      try {
        // Validate token using service
        const validation = await validateResetToken(token);
        
        setTokenValid(validation.valid);
        
        if (!validation.valid) {
          setError(validation.message);
        }
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
        setError('Unable to validate reset link. Please try again.');
      } finally {
        setTokenChecked(true);
      }
    };
    
    checkTokenValidity();
  }, [token]);

  /**
   * Validates form before submission
   */
  const validateForm = (): string | null => {
    if (!password.trim()) {
      return 'Please enter a new password';
    }
    
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    
    return null;
  };

  /**
   * Handles password reset submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (!token) {
      setError('Invalid reset token.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call reset password service
      const result = await resetPassword(token, password);
      
      if (result.success) {
        setSuccess(true);
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password reset successful! Please login with your new password.' }
          });
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renders loading state while checking token
   */
  if (!tokenChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-slate-900">Validating Reset Link</h2>
            <p className="text-slate-500 mt-2">Please wait while we verify your reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders invalid token state
   */
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Reset Link</h2>
            <p className="text-slate-600 mb-6">
              {error || 'This password reset link is invalid or has expired.'}
            </p>
            <div className="space-y-3">
              <Link to="/forgot-password">
                <Button className="w-full">
                  Request New Reset Link
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders success state
   */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successful!</h2>
            <p className="text-slate-600 mb-4">
              Your password has been successfully updated. You will be redirected to the login page shortly.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              Redirecting in 3 seconds...
            </p>
            <Link to="/login">
              <Button className="w-full">
                Go to Login Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders main reset form
   */
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="text-blue-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Set New Password</h1>
          <p className="text-slate-500">Create a new password for your account</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-600" size={18} />
              <span className="text-red-700 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Password reset form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* New password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-12 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
                minLength={8}
                aria-label="Enter new password"
                aria-required="true"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password strength meter */}
          {password && (
            <PasswordStrengthMeter 
              password={password}
            />
          )}

          {/* Confirm password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError(null);
                }}
                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  confirmPassword && password !== confirmPassword
                    ? 'border-red-300'
                    : confirmPassword && password === confirmPassword
                    ? 'border-green-300'
                    : 'border-slate-200'
                }`}
                required
                minLength={8}
                aria-label="Confirm new password"
                aria-required="true"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password match indicator */}
            {confirmPassword && (
              <div className={`mt-1 text-sm ${
                password === confirmPassword ? 'text-green-600' : 'text-red-600'
              }`}>
                {password === confirmPassword ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle size={14} />
                    <span>Passwords match</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <AlertCircle size={14} />
                    <span>Passwords do not match</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Password requirements */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Password Requirements:</h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                <span>Minimum 8 characters</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                <span>Include uppercase and lowercase letters</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                <span>Include at least one number</span>
              </li>
              <li className="flex items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mr-2"></div>
                <span>Include at least one special character</span>
              </li>
            </ul>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full py-3"
            isLoading={isLoading}
            disabled={isLoading}
            aria-label="Reset password"
          >
            Reset Password
          </Button>
        </form>

        {/* Back link */}
        <div className="text-center mt-6 pt-6 border-t border-slate-100">
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:underline"
            aria-label="Return to login"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
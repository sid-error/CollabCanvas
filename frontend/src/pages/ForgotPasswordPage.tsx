import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { requestPasswordReset, canRequestReset, trackResetRequest } from '../services/passwordResetService';

/**
 * ForgotPasswordPage component - Password reset request page
 * Allows users to request a password reset link via email
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');

  /**
   * Validates email before submission
   */
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'Please enter your email address';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    return null;
  };

  /**
   * Handles form submission for password reset request
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Check rate limiting
    if (!canRequestReset(email)) {
      setError('Please wait 5 minutes before requesting another reset link.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Call password reset service
      const result = await requestPasswordReset(email);
      
      if (result.success) {
        // Track the request
        trackResetRequest(email);
        
        setSuccess(true);
        setEmailSent(email);
        setEmail('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Password reset request error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Renders success state
   */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          {/* Back navigation */}
          <div className="mb-6">
            <Link 
              to="/login" 
              className="text-slate-400 hover:text-blue-600 flex items-center gap-2 text-sm transition-colors"
              aria-label="Return to login page"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
          
          {/* Success message */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h1>
            <p className="text-slate-600 mb-4">
              We've sent a password reset link to:
            </p>
            <p className="font-medium text-slate-800 bg-slate-50 p-3 rounded-lg mb-6">
              {emailSent}
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-left">
                <h3 className="font-medium text-blue-800 mb-2">What's next?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Check your inbox for an email from Collaborative Canvas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Click the link in the email to reset your password</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>The link will expire in 1 hour for security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>Check your spam folder if you don't see the email</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Didn't receive the email?
                </p>
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setError(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again with Different Email
                </Button>
                <Link to="/login">
                  <Button className="w-full">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      {/* Password reset card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        
        {/* Back navigation */}
        <div className="mb-6">
          <Link 
            to="/login" 
            className="text-slate-400 hover:text-blue-600 flex items-center gap-2 text-sm transition-colors"
            aria-label="Return to login page"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
        
        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-slate-500">
            Enter your email address and we'll send you a link to reset your password.
          </p>
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
          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail 
                className="absolute left-3 top-3 text-slate-400" 
                size={20} 
                aria-hidden="true" 
              />
              <input 
                id="email"
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
                aria-label="Enter your email address"
                aria-required="true"
                disabled={isLoading}
              />
            </div>
          </div>
          
          {/* Help text */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm text-slate-600">
              We'll send a secure link to your email that will allow you to create a new password. 
              This link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full py-3"
            isLoading={isLoading}
            disabled={isLoading}
            aria-label="Send password reset link"
          >
            Send Reset Link
          </Button>
        </form>

        {/* Additional help */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="text-center space-y-3">
            <p className="text-sm text-slate-500">
              Remember your password?
            </p>
            <Link 
              to="/login"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Back to Login
            </Link>
            <p className="text-xs text-slate-400 mt-4">
              Need help? Contact support@collaborativecanvas.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
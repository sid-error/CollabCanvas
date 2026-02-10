import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { verifyEmailToken } from '../utils/authService';

/**
 * Email Verification Page Component
 * 
 * This component handles email verification for user accounts.
 * Users arrive at this page after clicking email verification links.
 * Supports two URL patterns:
 * 1. /verify-email?token=TOKEN (query parameter)
 * 2. /verify-email/TOKEN (URL parameter)
 * 
 * @component
 * @returns {JSX.Element} The rendered email verification page
 * 
 * @example
 * URL patterns that trigger this component:
 * - /verify-email?token=abc123def456
 * - /verify-email/abc123def456
 * 
 * @remarks
 * Key Features:
 * 1. Dual token support (query param and URL param)
 * 2. Prevention of double API calls in React 18 StrictMode
 * 3. Automatic redirect on successful verification
 * 4. User-friendly loading and error states
 * 
 * Security Considerations:
 * - Tokens are single-use and time-limited
 * - Prevents double verification attempts
 * - Handles invalid/expired tokens gracefully
 */
const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const { token: pathToken } = useParams(); // Catch /verify-email/:token
  const navigate = useNavigate();
  
  // Verification status state
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  
  // Ref to prevent double-calling the API (React 18 StrictMode issue)
  const hasCalled = useRef(false);

  // Use the token from the query (?token=) OR from the path (/:token)
  const token = searchParams.get('token') || pathToken;

  /**
   * Effect to handle email verification on component mount
   * 
   * This effect:
   * 1. Validates the presence of a token
   * 2. Prevents double execution in React 18 StrictMode
   * 3. Calls the verification API
   * 4. Updates UI state based on API response
   * 5. Redirects on success after delay
   * 
   * @effect
   * @dependencies token, navigate
   * 
   * @remarks
   * The useRef prevents double execution which can cause:
   * - Duplicate API calls
   * - Inconsistent UI states
   * - "Activation Failed" errors on hidden second calls
   */
  useEffect(() => {
    /**
     * Asynchronous function to verify the email token
     * 
     * @async
     * @function verify
     * @returns {Promise<void>}
     */
    const verify = async () => {
      // 1. Check if token exists
      if (!token) {
        setStatus('failed');
        setMessage('No verification token found. Please check your email link.');
        return;
      }

      // 2. Prevent double execution (This often causes "Activation Failed" on the second hidden call)
      if (hasCalled.current) return;
      hasCalled.current = true;

      try {
        // 3. Call verification API
        const result = await verifyEmailToken(token);
        
        // 4. Handle API response
        if (result.success) {
          setStatus('success');
          setMessage(result.message);
          // Redirect to login after 3 seconds on success
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('failed');
          setMessage(result.message || 'Verification failed.');
        }
      } catch (err) {
        // 5. Handle network or unexpected errors
        setStatus('failed');
        setMessage('Connection error. Please try again.');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100">
        {/* 
          ======================
          Verification Loading State
          ======================
          Shows while API call is in progress
        */}
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold">Verifying Your Account</h2>
          </div>
        )}
        
        {/* 
          ======================
          Verification Success State
          ======================
          Shows when verification succeeds
          Automatically redirects to login after 3 seconds
        */}
        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-green-700">Success!</h2>
            <p className="text-slate-600">{message}</p>
          </div>
        )}
        
        {/* 
          ======================
          Verification Failed State
          ======================
          Shows when verification fails
          Provides helpful guidance for users
        */}
        {status === 'failed' && (
          <div className="space-y-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-red-700">Activation Failed</h2>
            <p className="text-slate-600">{message}</p>
            <p className="text-xs text-slate-400 mt-2">
              If you already verified, try logging in.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
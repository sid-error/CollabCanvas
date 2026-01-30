import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { verifyEmailToken, resendVerificationEmail } from '../utils/emailValidation';

/**
 * EmailVerificationPage component
 * Handles email verification flow with token validation
 */
const EmailVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'verifying' | 'success' | 'failed' | 'resent'
  >('idle');
  const [message, setMessage] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(0);
  
  const token = searchParams.get('token');

  useEffect(() => {
    // Auto-verify if token is present in URL
    if (token) {
      handleEmailVerification(token);
    }
  }, [token]);

  useEffect(() => {
    // Handle resend countdown timer
    if (resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown(resendCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  /**
   * Handles email verification with token
   */
  const handleEmailVerification = async (verificationToken: string) => {
    setVerificationStatus('verifying');
    
    const result = await verifyEmailToken(verificationToken);
    
    if (result.success) {
      setVerificationStatus('success');
      setMessage(result.message);
      if (result.email) setEmail(result.email);
      
      // Auto-redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Email verified successfully! Please login.' }
        });
      }, 3000);
    } else {
      setVerificationStatus('failed');
      setMessage(result.message);
    }
  };

  /**
   * Handles resending verification email
   */
  const handleResendVerification = async () => {
    if (!email || resendCountdown > 0) return;
    
    const result = await resendVerificationEmail(email);
    
    if (result.success) {
      setVerificationStatus('resent');
      setMessage(result.message);
      setResendCountdown(60); // 60-second cooldown
    } else {
      setVerificationStatus('failed');
      setMessage(result.message);
    }
  };

  const renderStatusContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Verifying Your Email</h2>
            <p className="text-slate-600">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <p className="text-sm text-slate-500">
              Redirecting to login page in 3 seconds...
            </p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </Button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            
            {email && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">
                  Would you like to resend the verification email?
                </p>
                <Button
                  onClick={handleResendVerification}
                  disabled={resendCountdown > 0}
                  className="w-full"
                >
                  {resendCountdown > 0 ? (
                    `Resend available in ${resendCountdown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <div className="mt-6 space-y-2">
              <Link 
                to="/login" 
                className="text-blue-600 hover:underline text-sm block"
              >
                Return to Login
              </Link>
              <Link 
                to="/register" 
                className="text-blue-600 hover:underline text-sm block"
              >
                Register Again
              </Link>
            </div>
          </div>
        );

      case 'resent':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-blue-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Verification Email Resent</h2>
            <p className="text-slate-600 mb-4">{message}</p>
            <p className="text-sm text-slate-500 mb-4">
              Please check your inbox and spam folder.
            </p>
            <div className="space-y-2">
              <Link 
                to="/login" 
                className="text-blue-600 hover:underline text-sm block"
              >
                Return to Login
              </Link>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-blue-600" size={32} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Email Verification Required</h2>
            <p className="text-slate-600 mb-4">
              Please check your email for the verification link.
            </p>
            <p className="text-sm text-slate-500 mb-6">
              If you haven't received an email, please check your spam folder or request a new verification email.
            </p>
            
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Need a new verification email?
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <Button
                  onClick={handleResendVerification}
                  disabled={!email || resendCountdown > 0}
                  className="w-full"
                >
                  {resendCountdown > 0 ? (
                    `Resend available in ${resendCountdown}s`
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <Link 
                to="/login" 
                className="text-blue-600 hover:underline text-sm block"
              >
                Return to Login
              </Link>
              <Link 
                to="/register" 
                className="text-blue-600 hover:underline text-sm block"
              >
                Register Again
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        {renderStatusContent()}
      </div>
    </div>
  );
};

export default EmailVerificationPage;
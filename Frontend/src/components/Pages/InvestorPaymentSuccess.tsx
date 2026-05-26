import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://fyp-1ejm.vercel.app';

export default function InvestorPaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) { setStatus('error'); return; }

      const token = localStorage.getItem('token');
      if (!token) { navigate('/'); return; }

      try {
        // Confirm payment with Stripe
        const r = await fetch(`${API}/api/payment/verify-investor/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await r.json();

        if (!d.success) { setStatus('error'); return; }

        // Retrieve the profile draft saved before redirect
        const draft = sessionStorage.getItem('investorProfileDraft');
        if (draft) {
          const save = await fetch(`${API}/api/investor/profile`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: draft,
          });
          if (save.ok) sessionStorage.removeItem('investorProfileDraft');
        }

        setStatus('success');
      } catch {
        setStatus('error');
      }
    };

    verify();
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {status === 'loading' && (
          <div>
            <Loader2 className="w-12 h-12 mx-auto mb-5 text-white animate-spin" />
            <p className="text-white text-lg font-medium">Activating your investor profile…</p>
            <p className="text-zinc-500 text-sm mt-2">This will only take a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">You're listed!</h1>
            <p className="text-zinc-400 mb-2">
              Your investor profile is now live on PRS.
            </p>
            <p className="text-zinc-600 text-sm mb-8">
              Founders can now discover you, review your investment criteria, and apply for funding.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/investor-connect?tab=profile')}
                className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-zinc-200 transition-colors"
              >
                View My Profile
              </button>
              <button
                onClick={() => navigate('/investor-connect')}
                className="border border-zinc-700 text-white font-medium px-8 py-3 rounded-full hover:border-zinc-500 transition-colors"
              >
                Browse Investors
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-zinc-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
            <p className="text-zinc-400 mb-8">
              We couldn't verify your payment. If money was charged, please contact support — your profile will be activated manually.
            </p>
            <button
              onClick={() => navigate('/investor-connect')}
              className="bg-white text-black font-semibold px-8 py-3 rounded-full hover:bg-zinc-200 transition-colors"
            >
              Back to Investor Connect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

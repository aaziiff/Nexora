import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLogin: React.FC = () => {
  const [passcode, setPasscode] = useState('');
  const { adminLogin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(passcode)) {
      showToast('Welcome back, Concierge Operator', 'success');
      navigate('/admin');
    } else {
      showToast('Invalid operator credentials. Please check your passcode.', 'error');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-ivory-100 p-8 sm:p-10 rounded-2xl border border-stone/30 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          <Logo variant="full" size="md" className="mx-auto" />
          <h2 className="font-serif text-2xl text-charcoal-950 font-normal pt-2">
            Operator Console
          </h2>
          <p className="text-xs text-charcoal-500 font-sans">
            Protected control portal for NEXORA catalog, fulfillment, and payment verification.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-luxury text-charcoal-700 font-medium block mb-1">
              Operator Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter operator passcode"
                className="w-full pl-10 pr-4 py-3 bg-ivory-50 border border-stone/60 rounded text-xs text-charcoal-900 focus:outline-none focus:border-charcoal-900 font-mono"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-charcoal-900 hover:bg-charcoal-950 text-ivory-100 text-xs font-semibold uppercase tracking-luxury py-3.5 px-4 rounded transition-colors shadow"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-stone/20 flex items-center justify-center gap-1.5 text-[10px] text-charcoal-400 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
          <span>Role Based Security Protected</span>
        </div>
      </div>
    </div>
  );
};

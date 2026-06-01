import React, { useState } from "react";
import { useFortune } from "../state/FortuneState";
import { motion } from "motion/react";
import { ShieldCheck, Mail, ArrowRight, Wallet, Lock, Sparkles } from "lucide-react";

export const LoginScreen: React.FC = () => {
  const { loginUser } = useFortune();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please key in a valid email address.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please use a proper email format (e.g. user@domain.com).");
      return;
    }

    setLoading(true);
    setLoadingStep(1); // establishing handshakes
    
    setTimeout(() => {
      setLoadingStep(2); // generating secure local certificates
    }, 600);

    setTimeout(() => {
      setLoadingStep(3); // linking decentralized payment protocols
    }, 1100);

    try {
      await loginUser(email);
    } catch (e: any) {
      setError(e.message || "Credential handshake failed. Please try again.");
      setLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setEmail("joelasuelimen12@gmail.com");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* Visual Ambient Glowing Blobs */}
      <div className="absolute top-1/4 left-1/4 w-[280px] h-[280px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: "6s" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 25 }}
        className="w-full max-w-[370px] bg-slate-900/80 border border-slate-800 rounded-[32px] p-6 text-slate-100 shadow-2xl relative z-10 backdrop-blur-md"
      >
        
        {/* Shimmer Line Progress Header */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[32px] overflow-hidden bg-slate-800">
          <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full animate-[shimmer_2s_infinite] absolute left-0" style={{
            keyframes: {
              '0%': { left: '-30%' },
              '100%': { left: '100%' }
            }
          }} />
        </div>

        {/* Brand Icon Shield Logo */}
        <div className="flex flex-col items-center text-center mt-3 mb-6">
          <motion.div 
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 shadow-inner relative"
          >
            <ShieldCheck className="w-8 h-8" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </motion.div>
          
          <h2 className="text-2xl font-medium font-display tracking-wide text-white italic capitalize">
            Fortune Navigator
          </h2>
          <p className="text-[10px] text-slate-400 font-mono tracking-widest mt-1 uppercase">
            Vault Integration Portal
          </p>
        </div>

        {loading ? (
          /* High-fidelity loading shimmer state steps */
          <div className="py-8 space-y-6 flex flex-col items-center">
            
            <div className="relative flex items-center justify-center">
              {/* Spinning Ring */}
              <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <Lock className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
            </div>

            <div className="text-center space-y-1.5 min-h-[50px]">
              <p className="text-sm font-bold tracking-tight text-white animate-pulse">
                Authorizing Cryptographic Node
              </p>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-400 font-mono flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1.5 animate-bounce" />
                  {loadingStep === 1 && "Verifying secure exchange coordinates..."}
                  {loadingStep === 2 && "Creating local signature keys..."}
                  {loadingStep >= 3 && "Linking PayPal, Visa, MasterCard interfaces..."}
                </span>
                
                {/* Horizontal shimmer line loader */}
                <div className="w-40 h-1 bg-slate-800 rounded-full overflow-hidden mt-3 relative">
                  <motion.div 
                    initial={{ left: "-100%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                  />
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Actual Input form */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }} 
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-400 leading-normal"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <label className="block text-[9.5px] uppercase font-bold font-mono text-slate-400 tracking-wider">
                Operator Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full text-xs font-mono bg-slate-950/85 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 pl-10 text-white outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-900/40 transition-all cursor-pointer relative overflow-hidden group active:scale-98"
            >
              <span>Verify & Unlock Vault</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Micro Demo Fast-Login */}
            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-[10px] text-slate-500 font-medium">Ready testing account available:</p>
              <button
                type="button"
                onClick={fillQuickDemo}
                className="mt-1.5 text-[10.5px] bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-indigo-400 hover:text-indigo-300 font-semibold py-1.5 px-3 rounded-full cursor-pointer transition-all inline-flex items-center space-x-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Sign in as joelasuelimen12@gmail.com</span>
              </button>
            </div>

            <div className="text-[9px] text-center text-slate-550 leading-relaxed pt-2 leading-normal">
              By unlocking, you secure physical access to trace, convert and optimize Visa, MasterCard, PayPal records locally.
            </div>

          </form>
        )}

      </motion.div>
    </div>
  );
};

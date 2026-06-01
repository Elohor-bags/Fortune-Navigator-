import React, { useState } from "react";
import { useFortune } from "../state/FortuneState";
import { motion, AnimatePresence } from "motion/react";
import { 
  CreditCard, Wallet, Link, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle, 
  WifiOff, ArrowRightCircle, Smartphone, AlertCircle, ShoppingBag, Radio 
} from "lucide-react";
import { ConnectedAccount } from "../types";

export const ConnectedAccounts: React.FC = () => {
  const { 
    user, 
    settings, 
    connectAccount, 
    disconnectAccount, 
    syncAccountPayments, 
    updateSettings 
  } = useFortune();

  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form fields
  const [accType, setAccType] = useState<ConnectedAccount["type"]>("paypal");
  const [accName, setAccName] = useState("");
  const [accDetails, setAccDetails] = useState("");
  const [accBalance, setAccBalance] = useState("");
  const [accCurrency, setAccCurrency] = useState("USD");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName || !accDetails) return;

    setLoading(true);
    setFormOpen(false);

    // Call state with optimistic insertion (handled organically in connectAccount)
    const initBalance = parseFloat(accBalance) || 0;
    
    // Reset Form
    setAccName("");
    setAccDetails("");
    setAccBalance("");

    await connectAccount({
      type: accType,
      name: accName,
      details: accDetails,
      balance: initBalance,
      currency: accCurrency
    });

    setLoading(false);
  };

  const getAccountIcon = (type: ConnectedAccount["type"]) => {
    switch (type) {
      case "paypal":
        return <span className="font-extrabold text-[#003087] font-display text-[15px] italic">Pр</span>;
      case "visa":
        return <span className="font-extrabold text-[#1A1F71] font-display text-xs italic tracking-wide">VISA</span>;
      case "mastercard":
        return <span className="font-black text-[#FF5F00] font-display text-xs italic">MC</span>;
      case "crypto_wallet":
        return <Wallet className="w-4 h-4 text-amber-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-slate-400" />;
    }
  };

  const getAccountColorClass = (type: ConnectedAccount["type"]) => {
    switch (type) {
      case "paypal":
        return "bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30";
      case "visa":
        return "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30";
      case "mastercard":
        return "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30";
      case "crypto_wallet":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30";
      default:
        return "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800";
    }
  };

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <div>
          <span className="text-[9.5px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-mono font-bold">
            Settlement Bridges
          </span>
          <h3 className="text-sm font-black font-display text-slate-800 dark:text-slate-100 flex items-center">
            Integrated Wallets
          </h3>
        </div>
        
        <button
          onClick={() => setFormOpen(prev => !prev)}
          className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-full text-[10.5px] cursor-pointer shadow-xs shadow-indigo-100/55 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{formOpen ? "Close" : "Connect"}</span>
        </button>
      </div>

      {/* Connection Drawer Form */}
      <AnimatePresence>
        {formOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl p-4.5 space-y-3.5"
          >
            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500">
                Integration Type
              </label>
              <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-200/55 dark:bg-slate-950 rounded-lg">
                {(["paypal", "visa", "mastercard", "crypto_wallet"] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAccType(type)}
                    className={`py-1 rounded text-[9.5px] font-bold capitalize transition-all cursor-pointer ${accType === type ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-3xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                  >
                    {type === "crypto_wallet" ? "Crypto" : type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] uppercase font-bold font-mono text-slate-400 dark:text-slate-505 mb-1">
                  Name tag
                </label>
                <input
                  type="text"
                  required
                  placeholder={accType === "paypal" ? "My Business PayPal" : accType === "crypto_wallet" ? "MetaMask Main Eth" : "Chase Platinum Visa"}
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold font-mono text-slate-400 dark:text-slate-505 mb-1">
                    {accType === "paypal" ? "PayPal Email" : accType === "crypto_wallet" ? "Public Address" : "Masked card (e.g. •••• 1234)"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={accType === "paypal" ? "name@domain.com" : accType === "crypto_wallet" ? "0x3f5...88ab" : "•••• 4851"}
                    value={accDetails}
                    onChange={e => setAccDetails(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold font-mono text-slate-400 dark:text-slate-505 mb-1">
                    Initial Balance ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 1250"
                    value={accBalance}
                    onChange={e => setAccBalance(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-3xs"
            >
              Verify credential & Connect Bridge
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Connected Accounts Live Shimmer List */}
      <div className="space-y-2">
        {user?.connectedAccounts && user.connectedAccounts.length > 0 ? (
          user.connectedAccounts.map((acct) => (
            <motion.div
              key={acct.id}
              layoutId={acct.id}
              className={`border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between transition-all shadow-3xs ${getAccountColorClass(acct.type)} relative overflow-hidden`}
            >
              
              {/* Syncing Loading Shimmer Effect */}
              {acct.status === "syncing" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              )}

              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                  {getAccountIcon(acct.type)}
                </div>
                
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {acct.name}
                    </p>
                    
                    {/* Status badges */}
                    {acct.status === "syncing" && (
                      <span className="text-[7.5px] font-mono px-1 bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 uppercase rounded-sm animate-pulse">Syncing</span>
                    )}
                    {acct.status === "error" && (
                      <span className="text-[7.5px] font-mono px-1 bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20 uppercase rounded-sm flex items-center"><AlertCircle className="w-2 h-2 mr-0.5" />Resiliency Failed</span>
                    )}
                    {acct.status === "connected" && (
                      <span className="text-[7.5px] font-mono px-1 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 font-bold border border-emerald-500/20 uppercase rounded-sm">Synced</span>
                    )}
                  </div>

                  <p className="text-[9px] text-slate-450 dark:text-slate-450 font-mono mt-0.5 truncate leading-relaxed">
                    {acct.details} • Sync: {acct.lastSynced}
                  </p>
                </div>
              </div>

              {/* Action operations */}
              <div className="flex items-center space-x-1.5 shrink-0">
                <div className="text-right">
                  <span className={`text-xs font-bold font-mono tracking-tight block ${acct.status === "error" ? "text-slate-400 line-through" : "text-slate-850 dark:text-slate-100"}`}>
                    ${acct.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[8px] text-slate-400 dark:text-slate-500 tracking-wider font-mono">USD TRACKER</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => syncAccountPayments(acct.id)}
                    disabled={acct.status === "syncing"}
                    className="p-1 px-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-500 cursor-pointer transition-colors"
                    title="Manual Reconciliation Run"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${acct.status === "syncing" ? "animate-spin" : ""}`} />
                  </button>
                  <button
                    onClick={() => disconnectAccount(acct.id)}
                    className="p-1 px-1.5 bg-white hover:bg-rose-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer transition-colors"
                    title="Revoke Secure Bridge link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Link className="w-6 h-6 text-slate-300 dark:text-slate-700 animate-pulse" />
            <p className="text-[11px] font-bold mt-2">Zero payment integrations linked</p>
            <p className="text-[8.5px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">Link a MasterCard, Visa, PayPal, or MetaMask wallet above</p>
          </div>
        )}
      </div>

    </div>
  );
};

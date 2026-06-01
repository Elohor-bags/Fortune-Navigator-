import React, { useState, useEffect } from "react";
import { useFortune } from "../state/FortuneState";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, Apple, HelpCircle, HardDrive, Wifi, WifiOff, RefreshCw, 
  Settings, Server, Terminal, ListCollapse, ChevronRight, ChevronLeft, Expand, RotateCcw
} from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";
import { ConnectedAccounts } from "./ConnectedAccounts";

const ViewportWorkspace: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useFortune();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false);

  // Filter active or syncing accounts count to represent live payments
  const connectedCount = user?.connectedAccounts.filter(a => a.status === "connected" || a.status === "syncing").length || 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative bg-white dark:bg-slate-950 overflow-hidden">
      {/* Top Header Navigation Bar */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between shrink-0 relative z-10">
        
        {/* Profile Avatar & shorthand email */}
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="w-6.5 h-6.5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center font-display font-black text-[10px] shadow-3xs border border-indigo-200 dark:border-indigo-805 shrink-0">
            {user?.email ? user.email.slice(0, 1).toUpperCase() : "J"}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold text-slate-850 dark:text-slate-200 truncate leading-tight select-all">
              {user?.email.split("@")[0]}
            </p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIntegrationsOpen(true)}
            className="p-1 px-2.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-805 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center space-x-1 cursor-pointer transition-colors shadow-3xs"
            title="Integrations & Wallets"
          >
            <span className="text-[11px] leading-none">💳</span>
            <span className="text-[9.5px] font-bold font-mono text-slate-700 dark:text-slate-300">
              {connectedCount}
            </span>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900/40 border border-slate-205 dark:border-slate-805 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 cursor-pointer transition-colors shadow-3xs"
            title="System Preferences"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 overflow-y-auto min-h-0 relative">
        {children}
      </div>

      {/* Drawer absolute overlays inside smartphone viewport dimensions */}
      <AnimatePresence>
        {integrationsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute inset-0 z-30 bg-white dark:bg-slate-950 flex flex-col p-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850 shrink-0 mb-3">
              <span className="text-xs font-bold font-display text-slate-700 dark:text-slate-200 flex items-center space-x-1">
                <span>Payment Settlement Bridges</span>
              </span>
              <button
                type="button"
                onClick={() => setIntegrationsOpen(false)}
                className="text-[9px] font-extrabold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-100/10 dark:hover:bg-slate-100/20 border border-slate-250 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
              >
                Dismiss
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-0.5">
              <ConnectedAccounts />
            </div>
          </motion.div>
        )}

        {settingsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="absolute inset-0 z-30 bg-white dark:bg-slate-950 flex flex-col p-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850 shrink-0 mb-3">
              <span className="text-xs font-bold font-display text-slate-700 dark:text-slate-200">
                Cabinet Preferences
              </span>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-[9px] font-extrabold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-100/10 dark:hover:bg-slate-100/20 border border-slate-250 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 cursor-pointer transition-all"
              >
                Dismiss
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-0.5">
              <SettingsPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DeviceShellProps {
  children: React.ReactNode;
  activeTab: "home" | "expenses" | "portfolio" | "advisor";
  onTabChange: (tab: "home" | "expenses" | "portfolio" | "advisor") => void;
}

export const DeviceShell: React.FC<DeviceShellProps> = ({ children, activeTab, onTabChange }) => {
  const { 
    baseCurrency, 
    setBaseCurrency, 
    status, 
    triggerManualSync,
    getExpenseBaseTotal,
    getPortfolioBaseTotal
  } = useFortune();

  const [deviceMode, setDeviceMode] = useState<"ios" | "android" | "tablet">("ios");
  const [panelOpen, setPanelOpen] = useState(true);
  const [deviceTime, setDeviceTime] = useState("");

  // Update virtual device status-bar clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDeviceTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="fn-device-shell" className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col md:flex-row font-sans transition-colors duration-300">
      
      {/* 1. Left Controls Console Panel (collapsible on mobile, elegant on desktop) */}
      <div 
        className={`bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shrink-0 select-none flex flex-col transition-all duration-300 relative border-r border-slate-200 dark:border-slate-800 ${
          panelOpen ? "w-full md:w-80" : "w-0 md:w-14 overflow-hidden"
        }`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-display italic font-medium text-base shadow-sm shadow-indigo-100">
              FN
            </div>
            {panelOpen && (
              <div>
                <h1 className="text-[15px] font-medium font-display leading-tight tracking-wide text-slate-900 dark:text-slate-100 italic">
                  Fortune Navigator
                </h1>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono tracking-wider">STATE OPERATIONS</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setPanelOpen(!panelOpen)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            title={panelOpen ? "Close dashboard console" : "Open dashboard controls"}
          >
            {panelOpen ? <ListCollapse className="w-4.5 h-4.5" /> : <ChevronRight className="w-4.5 h-4.5" />}
          </button>
        </div>

        {panelOpen && (
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* System Performance Overview */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[9px] font-bold text-slate-400 dark:text-indigo-400 font-mono tracking-wider uppercase">System Indicators</span>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center">
                    <HardDrive className="w-3 h-3 mr-1.5 text-slate-400" /> Registry Cache:
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9.5px]">Hydrated</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center">
                    <Server className="w-3 h-3 mr-1.5 text-slate-400" /> Background:
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase text-[9.5px]">Active (15s)</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center">
                    {status.isOffline ? <WifiOff className="w-3 h-3 mr-1.5 text-amber-500" /> : <Wifi className="w-3 h-3 mr-1.5 text-slate-400" />} 
                    Socket State:
                  </span>
                  <span className={`font-bold uppercase text-[9.5px] ${status.isOffline ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {status.isOffline ? "LOCAL" : "CONNECTED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Set Device Aspect Ratio Simulator */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">Shell Emulator Mode</span>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800/50">
                <button
                  onClick={() => setDeviceMode("ios")}
                  className={`text-[10px] font-bold text-center py-1.5 rounded-md transition-all cursor-pointer ${deviceMode === "ios" ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                >
                  iOS Apple
                </button>
                <button
                  onClick={() => setDeviceMode("android")}
                  className={`text-[10px] font-bold text-center py-1.5 rounded-md transition-all cursor-pointer ${deviceMode === "android" ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                >
                  Android
                </button>
                <button
                  onClick={() => setDeviceMode("tablet")}
                  className={`text-[10px] font-bold text-center py-1.5 rounded-md transition-all cursor-pointer ${deviceMode === "tablet" ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
                >
                  Tablet
                </button>
              </div>
            </div>

            {/* Set Primary Base Quoting Currency */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">Base Quote Asset</span>
              <select
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="USD">USD ($) United States Dollar</option>
                <option value="EUR">EUR (€) Euro Zone</option>
                <option value="GBP">GBP (£) British Pound Sterling</option>
                <option value="CAD">CAD ($) Canadian Dollar</option>
                <option value="AUD">AUD ($) Australian Dollar</option>
                <option value="JPY">JPY (¥) Japanese Yen</option>
                <option value="NGN">NGN (₦) Nigerian Naira</option>
              </select>
            </div>

            {/* Force Background Sycner Trigger */}
            <div className="space-y-2">
              <button
                onClick={triggerManualSync}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold p-2.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status.isSyncing ? 'animate-spin' : ''}`} />
                <span>Trigger Manual Sync</span>
              </button>
            </div>

            {/* Continuous Log Stream Output */}
            <div className="space-y-2 flex flex-col flex-1 min-h-0">
              <div className="flex justify-between items-center pr-1">
                <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase flex items-center">
                  <Terminal className="w-3 h-3 mr-1 text-slate-400" /> Log Stream
                </span>
                <span className="text-[8.5px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 py-0.5 px-1.5 rounded border border-slate-200/50 dark:border-slate-800">
                  {status.logs.length} entries
                </span>
              </div>
              
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850 text-[10px] font-mono p-3 rounded-lg text-slate-600 dark:text-slate-400 space-y-1.5 min-h-[140px] max-h-[210px] overflow-y-auto select-text">
                {status.logs.map((log, index) => (
                  <div key={index} className="leading-normal">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Closed Sidebar Icon lists */}
        {!panelOpen && (
          <div className="flex flex-col items-center space-y-5 pt-6 flex-1 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setPanelOpen(true)}
              className="p-1 px-2 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              &gt;
            </button>
            <div className="w-2 h-2 rounded-full bg-emerald-500" title="System running" />
            <Smartphone className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer" onClick={() => setDeviceMode("ios")} />
            <select
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value)}
              className="text-[9px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300 outline-none w-10 text-center cursor-pointer"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="NGN">NGN</option>
            </select>
            <RefreshCw className={`w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer ${status.isSyncing ? 'animate-spin' : ''}`} onClick={triggerManualSync} />
          </div>
        )}
      </div>

      {/* 2. Right Device frame center-alignment zone */}
      <div className="flex-1 flex items-center justify-center p-3 relative overflow-auto">
        
        {deviceMode === "tablet" ? (
          /* Maximized wide / Tablet-like view */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-lg h-[640px] flex flex-col overflow-hidden"
          >
            {/* Tablet Status Header bar */}
            <div className="bg-slate-55 dark:bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-850 text-xs">
              <span className="font-bold text-slate-600 dark:text-slate-300 font-mono flex items-center">
                📊 FORTUNE TABLET INTERFACE
              </span>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                <span>WiFi 6G</span>
                <span>•</span>
                <span>Charging 100%</span>
              </div>
            </div>

            {/* Scrolling View container */}
            <div className="flex-1 flex flex-col min-h-0 relative max-h-[520px]">
              <ViewportWorkspace>{children}</ViewportWorkspace>
            </div>

            {/* Custom Tab system navbar */}
            <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-850 py-2.5 px-6 flex justify-around select-none">
              <TabButton active={activeTab === "home"} label="Portfolio" icon="🏦" onClick={() => onTabChange("home")} />
              <TabButton active={activeTab === "expenses"} label="Expenses" icon="📊" onClick={() => onTabChange("expenses")} />
              <TabButton active={activeTab === "portfolio"} label="Vault" icon="💎" onClick={() => onTabChange("portfolio")} />
              <TabButton active={activeTab === "advisor"} label="Advisor AI" icon="🧠" onClick={() => onTabChange("advisor")} />
            </div>
          </motion.div>
        
        ) : (
          /* High-Fidelity Smartphone mock contours */
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`relative mx-auto rounded-[52px] border-[12px] bg-slate-950 shadow-2xl overflow-hidden flex flex-col h-[670px] w-[326px] ${
              deviceMode === "ios" 
                ? "border-slate-850 ring-1 ring-slate-800/80 rounded-[44px]" 
                : "border-slate-900 ring-2 ring-slate-850 rounded-[50px]"
            }`}
          >
            {/* Decorative volume / power buttons on device side edges */}
            <div className="absolute top-28 -left-[14px] w-[2.5px] h-10 bg-slate-700 rounded-r-sm" />
            <div className="absolute top-44 -left-[14px] w-[2.5px] h-14 bg-slate-700 rounded-r-sm" />
            <div className="absolute top-60 -left-[14px] w-[2.5px] h-14 bg-slate-700 rounded-r-sm" />
            <div className="absolute top-40 -right-[14px] w-[2.5px] h-18 bg-slate-700 rounded-l-sm" />

            {/* Device screen area wrapper */}
            <div className="flex-1 bg-white dark:bg-slate-950 flex flex-col overflow-hidden relative select-none">
              
              {/* Virtual System Status bar */}
              <div className="h-10 shrink-0 bg-slate-50 dark:bg-slate-950 flex items-end justify-between px-6 pb-1 relative z-20">
                <span className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 font-mono select-none">
                  {deviceTime}
                </span>

                {/* Simulated hardware elements (iOS Notch/Island vs Android Punchhole) */}
                {deviceMode === "ios" ? (
                  /* Dynamic Island mockup */
                  <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-20 h-[19px] bg-black rounded-full flex items-center justify-end px-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-950/80 mr-1" />
                    <span className="w-1 h-1 rounded-full bg-[#050510]" />
                  </div>
                ) : (
                  /* Android punch camera */
                  <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center">
                    <span className="w-1 h-1 rounded-full bg-slate-950" />
                  </div>
                )}

                {/* Wifi / Battery System icons */}
                <div className="flex items-center space-x-1 text-slate-600 dark:text-slate-300">
                  <Wifi className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[9.5px] font-mono font-bold shrink-0">5G</span>
                  <div className="w-[18px] h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center shrink-0">
                    <div className="h-full bg-slate-600 dark:bg-slate-350 w-3/4 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Central Scrolling application container */}
              <div className="flex-1 flex flex-col min-h-0 relative max-h-[530px]">
                <ViewportWorkspace>{children}</ViewportWorkspace>
              </div>

              {/* Native software navigation dock bars */}
              {deviceMode === "ios" ? (
                /* Apple iOS Bottom Toolbar with real-time gesture feedback */
                <div className="bg-slate-50/90 dark:bg-slate-950/95 border-t border-slate-100 dark:border-slate-900/60 pb-5 pt-2 px-3 flex justify-around select-none">
                  <TabButton active={activeTab === "home"} label="Portfolio" icon="🏦" onClick={() => onTabChange("home")} />
                  <TabButton active={activeTab === "expenses"} label="Expenses" icon="📊" onClick={() => onTabChange("expenses")} />
                  <TabButton active={activeTab === "portfolio"} label="Vault" icon="💎" onClick={() => onTabChange("portfolio")} />
                  <TabButton active={activeTab === "advisor"} label="Advisor AI" icon="🧠" onClick={() => onTabChange("advisor")} />

                  {/* iOS bottom thin black swipe-up home line */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-slate-700 rounded-full" />
                </div>
              ) : (
                /* Google Android Bottom Action controls */
                <div className="flex flex-col select-none">
                  {/* Tab icons */}
                  <div className="bg-slate-50/90 dark:bg-slate-950/95 border-t border-slate-100 dark:border-slate-900/60 py-2.5 px-3 flex justify-around">
                    <TabButton active={activeTab === "home"} label="Portfolio" icon="🏦" onClick={() => onTabChange("home")} />
                    <TabButton active={activeTab === "expenses"} label="Expenses" icon="📊" onClick={() => onTabChange("expenses")} />
                    <TabButton active={activeTab === "portfolio"} label="Vault" icon="💎" onClick={() => onTabChange("portfolio")} />
                    <TabButton active={activeTab === "advisor"} label="Advisor AI" icon="🧠" onClick={() => onTabChange("advisor")} />
                  </div>
                  {/* Material 3 software buttons */}
                  <div className="bg-slate-100 dark:bg-slate-950/95 h-10 flex items-center justify-around px-8 border-t border-slate-50 dark:border-slate-850">
                    <span className="text-slate-400 font-light hover:text-slate-100 cursor-pointer">&lt;</span>
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-400" />
                    <div className="w-3 h-3 bg-slate-400 opacity-80 rounded-[2px]" />
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

// Lightweight sub button for high-fidelity dock menus
const TabButton: React.FC<{ active: boolean; label: string; icon: string; onClick: () => void }> = ({
  active,
  label,
  icon,
  onClick,
}) => (
  <button
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className="flex flex-col items-center flex-1 py-1 transition-all focus:outline-none cursor-pointer"
  >
    <div className={`text-lg mb-1 leading-none transition-transform duration-200 ${active ? 'scale-115 -translate-y-0.5 font-bold' : 'scale-100 opacity-60'}`}>
      {icon}
    </div>
    <span className={`text-[9px] font-medium leading-none ${active ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
      {label}
    </span>
  </button>
);

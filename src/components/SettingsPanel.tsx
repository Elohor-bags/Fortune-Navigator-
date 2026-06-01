import React from "react";
import { useFortune } from "../state/FortuneState";
import { motion } from "motion/react";
import { 
  Volume2, VolumeX, Smartphone, RefreshCw, Sun, Moon, Sparkles, 
  Settings, LogOut, Check, HelpCircle, Shield, Bolt 
} from "lucide-react";
import { UserSettings } from "../types";

export const SettingsPanel: React.FC = () => {
  const { user, settings, updateSettings, logoutUser } = useFortune();

  const themes = [
    { 
      id: "dark" as const, 
      name: "Cosmic Slate", 
      desc: "Default Indigo Dark mode", 
      colors: ["bg-slate-900", "bg-indigo-500"] 
    },
    { 
      id: "light" as const, 
      name: "Elegant Light", 
      desc: "Soft light background", 
      colors: ["bg-white", "bg-indigo-600"] 
    },
    { 
      id: "nord" as const, 
      name: "Frozen Nord", 
      desc: "Chilly arctic slate & blue", 
      colors: ["bg-slate-950", "bg-teal-500"] 
    },
    { 
      id: "cyberpunk" as const, 
      name: "Cyberpunk Glow", 
      desc: "Neon dark cyber glows", 
      colors: ["bg-black", "bg-purple-500"] 
    },
    { 
      id: "emerald" as const, 
      name: "Emerald Forest", 
      desc: "Deep rich mint forest", 
      colors: ["bg-emerald-950", "bg-emerald-400"] 
    }
  ];

  const handleToggleSound = () => {
    updateSettings({ soundEffects: !settings.soundEffects });
  };

  const handleToggleHaptic = () => {
    updateSettings({ hapticFeedback: !settings.hapticFeedback });
  };

  const handleToggleOptimistic = () => {
    updateSettings({ optimisticUI: !settings.optimisticUI });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 space-y-5 shadow-xs">
      
      {/* Header section */}
      <div>
        <span className="text-[9.5px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono font-bold">
          System Preferences
        </span>
        <h3 className="text-sm font-black font-display text-slate-800 dark:text-slate-100 flex items-center space-x-1">
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Cabinet Customization</span>
        </h3>
      </div>

      {/* Brand Identity / User banner */}
      {user && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[8.5px] uppercase font-bold font-mono text-indigo-500 dark:text-indigo-400">Authenticated Agent</span>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user.email}</p>
          </div>
          <button
            onClick={logoutUser}
            className="flex items-center space-x-1 py-1 px-3 border border-rose-200 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-lg text-[10.5px] font-bold cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      )}

      {/* Theme Matrix Options */}
      <div className="space-y-2">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block uppercase">
          Portal Themes
        </span>
        
        <div className="grid grid-cols-1 gap-2">
          {themes.map(t => {
            const isSelected = settings.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => updateSettings({ theme: t.id })}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected 
                    ? "border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 shadow-3xs" 
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-950"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1 border border-slate-200/40 dark:border-slate-800 p-0.5 rounded-md">
                    <span className={`w-3.5 h-3.5 rounded-full ${t.colors[0]}`} />
                    <span className={`w-3.5 h-3.5 rounded-full ${t.colors[1]}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-850 dark:text-slate-100 flex items-center">
                      {t.name}
                      {isSelected && <Sparkles className="w-3 h-3 text-indigo-500 dark:text-indigo-400 ml-1.5" />}
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">{t.desc}</p>
                  </div>
                </div>

                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                  isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"
                }`}>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-[9px] text-center text-slate-400 leading-normal border-t border-slate-100 dark:border-slate-850 pt-3">
        Fortune Navigator Custom Cabinet • Secured Locally with SHA-256 Certificates
      </div>

    </div>
  );
};

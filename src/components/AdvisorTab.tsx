import React, { useState, useEffect } from "react";
import { useFortune } from "../state/FortuneState";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Sparkles, CheckCircle, HelpCircle, FileText, Bot, AlertTriangle } from "lucide-react";

// Cycle of reassurance messages during AI analysis
const CHECKLIST_MESSAGES = [
  "Auditing multi-currency exposure metrics...",
  "Calibrating asset-liability diversification ratios...",
  "Running Monte Carlo models on crypto volatility coefficients...",
  "Analyzing cash leakage in conversion exchanges...",
  "Synthesizing personal budget advice...",
];

export const AdvisorTab: React.FC = () => {
  const { getAIInsights, expenses, portfolio } = useFortune();

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>(() => {
    return localStorage.getItem("fn_saved_ai_report") || "";
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [checklistIndex, setChecklistIndex] = useState(0);

  // Rotate loading checkpoints automatically
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setChecklistIndex(prev => (prev + 1) % CHECKLIST_MESSAGES.length);
      }, 2600);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const runAdvisor = async () => {
    setLoading(true);
    setErrorMsg("");
    setChecklistIndex(0);
    try {
      const report = await getAIInsights();
      setAnalysis(report);
      localStorage.setItem("fn_saved_ai_report", report);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Unable to acquire insights from Fortune Server. Please confirm credentials in Secrets.");
    } finally {
      setLoading(false);
    }
  };

  // Safe custom Markdown formatter to styled HTML blocks for absolute performance with no package dependencies
  const formatMarkdownToJSX = (mdText: string) => {
    if (!mdText) return null;

    const lines = mdText.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      // Header H3
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold font-display text-indigo-700 dark:text-indigo-300 mt-4 mb-2 flex items-center">
            <span className="w-1.5 h-3.5 bg-indigo-500 rounded-xs mr-2 shrink-0" />
            {trimmed.replace(/^###\s+/, "")}
          </h4>
        );
      }

      // Header H2
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-md font-extrabold font-display text-slate-800 dark:text-slate-100 mt-6 mb-3 border-b border-indigo-50/50 pb-1.5 flex items-center">
            <Sparkles className="w-4 h-4 text-indigo-500 mr-1.5 shrink-0" />
            {trimmed.replace(/^##\s+/, "")}
          </h3>
        );
      }

      // Bold sections wrapper helper
      const renderWithBoldPhrases = (text: string) => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return <strong key={pIdx} className="font-bold text-slate-800 dark:text-slate-100">{part}</strong>;
          }
          return part;
        });
      };

      // Bullet List line
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <div key={idx} className="flex items-start space-x-2 pl-2 text-[11px] text-slate-600 dark:text-slate-300 my-1 font-sans">
            <span className="text-indigo-400 mt-1 shrink-0">•</span>
            <span className="flex-1">{renderWithBoldPhrases(trimmed.substring(1).trim())}</span>
          </div>
        );
      }

      // Number list line
      if (/^\d+\./.test(trimmed)) {
        const lineContent = trimmed.replace(/^\d+\.\s+/, "");
        return (
          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 my-3 text-[11px] font-sans">
            <div className="flex items-start space-x-2">
              <span className="font-mono bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[10px] px-1.5 rounded-md font-bold self-start mt-0.5 shrink-0">
                {idx + 1}
              </span>
              <p className="flex-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                {renderWithBoldPhrases(lineContent)}
              </p>
            </div>
          </div>
        );
      }

      // Simple spacing line or regular paragraphed text
      if (trimmed.length === 0) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-[11.5px] leading-relaxed text-slate-500 dark:text-slate-400 font-sans my-1 bg-white/20">
          {renderWithBoldPhrases(trimmed)}
        </p>
      );
    });
  };

  return (
    <div id="fn-advisor-tab" className="space-y-4 px-1 py-1">
      {/* Header Info */}
      <div>
        <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
          Autonomous Diagnostics
        </span>
        <h2 className="text-[23px] font-medium font-display tracking-wide text-slate-900 dark:text-slate-100 italic capitalize">
          Fortune AI Advisor
        </h2>
      </div>

      {/* Main Command Center Box */}
      <div className="bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 opacity-[0.03] dark:opacity-10 translate-x-4 -translate-y-4 text-slate-900 dark:text-white">
          <Bot className="w-36 h-36" />
        </div>

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50/75 dark:bg-indigo-950/30 flex items-center justify-center border border-indigo-100/40 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Cpu className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm font-display text-slate-800 dark:text-slate-100">Capital Risk Optimizer</h3>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-450 mt-1 leading-relaxed">
              Generate a personalized diagnostic review of currency, stock concentration, and liquidity. AI evaluates your actual assets and liability ratios.
            </p>
          </div>
        </div>

        <button
          onClick={runAdvisor}
          disabled={loading || (expenses.length === 0 && portfolio.length === 0)}
          className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl mt-4 flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            loading 
              ? "bg-slate-100 dark:bg-slate-850 text-slate-400 dark:text-slate-500 cursor-not-allowed" 
              : expenses.length === 0 && portfolio.length === 0
                ? "bg-slate-100 dark:bg-slate-855 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-750 text-white shadow-sm shadow-indigo-100/55"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? "Constructing Analysis..." : "Trigger AI Diagnostic Audit"}</span>
        </button>

        {expenses.length === 0 && portfolio.length === 0 && (
          <p className="text-[9.5px] text-amber-600 dark:text-amber-400 mt-2 text-center font-mono font-medium">
            * Please add assets or expense items first to evaluate.
          </p>
        )}
      </div>

      {loading && (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 text-center shadow-xs flex flex-col items-center justify-center space-y-4 animate-pulse">
          <Bot className="w-10 h-10 text-indigo-500 animate-spin" style={{ animationDuration: '4s' }} />
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
              Generating Advisor Report...
            </p>
            <p className="text-[10px] text-slate-400 font-mono italic">
              {CHECKLIST_MESSAGES[checklistIndex]}
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/40 rounded-xl p-3 flex items-start space-x-2 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Execution Blocked</p>
            <p className="text-[10px] font-mono whitespace-pre-wrap">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Analysis report output area */}
      <AnimatePresence>
        {!loading && analysis && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xs"
          >
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
              <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300 flex items-center">
                <FileText className="w-4 h-4 mr-1 text-slate-400 shrink-0" /> AUDITING DIAGNOSES REPORT
              </span>
              <span className="text-[9px] font-mono text-slate-400 font-bold bg-white dark:bg-slate-900 py-0.5 px-2 rounded border border-slate-200/60 dark:border-slate-800">
                SECURED
              </span>
            </div>

            <div className="divide-y divide-slate-50 dark:divide-slate-800 gap-y-2 py-1 select-text">
              {formatMarkdownToJSX(analysis)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

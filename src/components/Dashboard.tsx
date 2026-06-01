import React, { useMemo } from "react";
import { useFortune } from "../state/FortuneState";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Landmark, PieChart, RefreshCw, Smartphone, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart as RePie, Pie } from "recharts";

interface DashboardProps {
  onNavigate: (tab: "home" | "expenses" | "portfolio" | "advisor") => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#F59E0B", // amber
  Rent: "#EF4444", // red
  Transport: "#3B82F6", // blue
  Tech: "#8B5CF6", // purple
  Entertainment: "#EC4899", // pink
  Investments: "#10B981", // emerald
  Utilities: "#14B8A6", // teal
  Other: "#64748B", // slate
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const {
    baseCurrency,
    expenses,
    portfolio,
    status,
    prices,
    getExpenseBaseTotal,
    getPortfolioBaseTotal,
    getCombinedCapitalNet,
    convertUSDToBase,
  } = useFortune();

  const netNet = getCombinedCapitalNet();
  const totalAssets = getPortfolioBaseTotal();
  const totalExpenses = getExpenseBaseTotal();

  // Helper to format currency values beautifully
  const formatValue = (num: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: baseCurrency,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Pre-process expense categories for Rechants Pie Chart
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    expenses.forEach(e => {
      counts[e.category] = (counts[e.category] || 0) + e.convertedValue;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
      color: CATEGORY_COLORS[name] || "#94A3B8",
    }));
  }, [expenses]);

  // Pre-process portfolio splits for Allocation Bar Chart
  const portfolioData = useMemo(() => {
    const splits = { stocks: 0, crypto: 0 };
    portfolio.forEach(asset => {
      const valUSD = asset.quantity * asset.currentPrice;
      const valBase = convertUSDToBase(valUSD);
      if (asset.type === "crypto") splits.crypto += valBase;
      if (asset.type === "stock") splits.stocks += valBase;
    });

    return [
      { name: "Portfolio Assets", Crypto: Number(splits.crypto.toFixed(2)), Stocks: Number(splits.stocks.toFixed(2)) }
    ];
  }, [portfolio, convertUSDToBase]);

  // Get active currency details
  const activeExchanges = useMemo(() => {
    const list = ["USD", "EUR", "GBP", "NGN", "JPY", "CAD"];
    return list.filter(c => c !== baseCurrency).map(c => {
      const rawRate = prices.forex[c] || 1;
      const baseRate = prices.forex[baseCurrency] || 1;
      const exchangeValue = baseRate / rawRate;
      return {
        currency: c,
        rate: exchangeValue,
      };
    });
  }, [prices, baseCurrency]);

  return (
    <div id="fn-dashboard" className="space-y-5 px-1 py-2">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Global Wealth Radar
          </span>
          <h2 className="text-[23px] font-medium font-display tracking-wide text-slate-900 dark:text-slate-100 italic capitalize">
            Cabinet Portal
          </h2>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-full py-1 px-2.5">
          <span className={`w-1.5 h-1.5 rounded-full ${status.isOffline ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-[9px] font-mono font-medium text-slate-600 dark:text-slate-300">
            {status.isOffline ? "LOCAL MODE" : "LIVE FEED"}
          </span>
        </div>
      </div>

      {/* Main Net Worth Bento Slate */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85 p-5 text-slate-800 dark:text-slate-100 shadow-sm"
      >
        <div className="absolute right-0 bottom-0 opacity-[0.03] dark:opacity-10 translate-x-4 translate-y-4 text-slate-900 dark:text-white">
          <Wallet className="w-40 h-40" />
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-mono tracking-wider uppercase">Net Worth Valuation</p>
            <h1 className="text-3xl font-extrabold font-mono tracking-tight mt-1 text-slate-900 dark:text-white">
              {formatValue(netNet)}
            </h1>
          </div>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md font-mono font-bold border border-slate-200/55 dark:border-slate-700">
            {baseCurrency}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-450 dark:text-slate-500 block text-[9.5px] font-mono tracking-wider uppercase">PORTFOLIO HOLDINGS</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span className="font-bold font-mono tracking-wide text-slate-800 dark:text-slate-100">
                {formatValue(totalAssets)}
              </span>
            </div>
          </div>
          <div>
            <span className="text-slate-450 dark:text-slate-500 block text-[9.5px] font-mono tracking-wider uppercase">EXPENSE LIABILITIES</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span className="font-bold font-mono tracking-wide text-slate-800 dark:text-slate-100">
                {formatValue(totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sub-Bento allocations and metrics */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate("expenses")}
          className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl block transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-50/70 dark:bg-rose-950/20 flex items-center justify-center text-rose-500 mb-2">
            <TrendingDown className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Expenses</p>
          <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
            {expenses.length} Records
          </p>
        </button>

        <button
          onClick={() => onNavigate("portfolio")}
          className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl block transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500 mb-2">
            <Landmark className="w-4 h-4" />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Assets Vault</p>
          <p className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
            {portfolio.length} Holdings
          </p>
        </button>
      </div>

      {/* Dynamic Visualizations Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-4 shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
          Dynamic Allocations
        </h3>
        
        {/* Render Expense Categories Pie Chart */}
        {categoryData.length > 0 ? (
          <div className="space-y-4">
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePie>
                  <Tooltip 
                    formatter={(val) => [`${formatValue(Number(val))}`, "Total spent"]} 
                    contentStyle={{ border: 'none', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RePie>
              </ResponsiveContainer>
              
              {/* Legend overlay */}
              <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                <PieChart className="w-5 h-5 text-indigo-500 mt-1" />
                <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-mono mt-0.5">Expense</span>
                <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                  Deficits
                </span>
              </div>
            </div>

            {/* Custom Interactive labels list */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {categoryData.slice(0, 6).map((cat) => (
                <div key={cat.name} className="flex items-center space-x-1.5 py-1 px-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800/40">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium truncate">{cat.name}:</span>
                  <span className="font-mono text-slate-850 dark:text-slate-100 font-semibold">{formatValue(cat.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs font-medium">No expenses booked yet</p>
            <button
              onClick={() => onNavigate("expenses")}
              className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
            >
              + Create First Expense
            </button>
          </div>
        )}

        {/* Portfolio Type Chart Bar */}
        {portfolio.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 dark:text-slate-550 block mb-2 font-mono">ASSET ALLOCATION RATIO</span>
            <div className="h-14 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={portfolioData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip formatter={(val) => formatValue(Number(val))} />
                  <Bar dataKey="Crypto" stackId="a" fill="#10B981" barSize={10} radius={[6, 0, 0, 6]} />
                  <Bar dataKey="Stocks" stackId="a" fill="#3B82F6" barSize={10} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono px-1">
              <span className="flex items-center text-slate-600 dark:text-slate-450"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1" />Crypto holdings</span>
              <span className="flex items-center text-slate-600 dark:text-slate-450"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1" />Equities & Stocks</span>
            </div>
          </div>
        )}
      </div>

      {/* Forex Conversion Radar */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
            FX Radar ({baseCurrency} exchanges)
          </h4>
          <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono font-medium">
            1 {baseCurrency} equals
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {activeExchanges.map((ex) => (
            <div
              key={ex.currency}
              className="bg-white dark:bg-slate-800/30 rounded-lg p-2 text-center text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800/60"
            >
              <div className="text-[9px] font-mono text-slate-400 dark:text-slate-500 font-bold">{ex.currency}</div>
              <div className="text-[10.5px] font-mono font-bold mt-0.5 truncate text-slate-700 dark:text-slate-200">
                {ex.rate.toLocaleString(undefined, { maximumFractionDigits: 3 })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

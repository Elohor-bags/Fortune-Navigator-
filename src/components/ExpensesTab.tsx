import React, { useState, useMemo } from "react";
import { useFortune } from "../state/FortuneState";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Calendar, DollarSign, Filter, Sparkles, AlertCircle } from "lucide-react";
import { Expense } from "../types";

const CATEGORY_ICONS: Record<string, string> = {
  Food: "🍔",
  Rent: "🏠",
  Transport: "🚲",
  Tech: "💻",
  Entertainment: "🎬",
  Investments: "📈",
  Utilities: "💡",
  Other: "🏷️",
};

export const ExpensesTab: React.FC = () => {
  const {
    baseCurrency,
    expenses,
    prices,
    addExpense,
    deleteExpense,
    convertValueBetween,
  } = useFortune();

  // Component Form State
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState<Expense["category"]>("Food");
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const [formOpen, setFormOpen] = useState(false);

  // Live conversion feedback during typing!
  const liveConversionFeedback = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return null;
    const converted = convertValueBetween(num, currency, baseCurrency);
    return Number(converted.toFixed(2));
  }, [value, currency, baseCurrency, convertValueBetween]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = parseFloat(value);
    if (!label.trim() || isNaN(parsedVal) || parsedVal <= 2e-3) return;

    addExpense({
      label: label.trim(),
      value: parsedVal,
      currency,
      category,
      date,
    });

    // Reset Form
    setLabel("");
    setValue("");
    setFormOpen(false);
  };

  // Filtered Expense list
  const filteredExpenses = useMemo(() => {
    let list = [...expenses];
    if (filterCategory !== "All") {
      list = list.filter(e => e.category === filterCategory);
    }
    // Sort descending by date
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCategory]);

  const totalFilteredValue = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.convertedValue, 0);
  }, [filteredExpenses]);

  // Total value formatter
  const formatValue = (num: number, cur = baseCurrency) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur,
    }).format(num);
  };

  return (
    <div id="fn-expenses-tab" className="space-y-4 px-1 py-1">
      {/* Header and Floating Adder Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Ledger Register
          </span>
          <h2 className="text-[23px] font-medium font-display tracking-wide text-slate-900 dark:text-slate-100 italic capitalize">
            Debits Ledgers
          </h2>
        </div>
        <button
          onClick={() => setFormOpen(prev => !prev)}
          className="flex items-center space-x-1 py-1.5 px-3 rounded-full text-xs font-bold bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-100/55 hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{formOpen ? "Dismiss" : "Add Record"}</span>
        </button>
      </div>

      {/* Accordion Form Panel to register a record */}
      <AnimatePresence>
        {formOpen && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            onSubmit={handleSubmit}
            className="overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-805 rounded-2xl p-4 space-y-3.5 shadow-sm"
          >
            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                Transaction Descriptor
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g., Office Supplies, AWS Server, Gala Diner"
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                  Original sum
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-mono">#</span>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder="120.00"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2.5 pl-7 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                  Sum currency
                </label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 cursor-pointer"
                >
                  {Object.keys(prices.forex).map(cur => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live conversion prompt widget */}
            {liveConversionFeedback !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg p-2 px-3 flex items-center justify-between text-xs font-mono"
              >
                <span className="text-slate-500 dark:text-slate-400 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-slate-450" /> Convert feedback:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatValue(liveConversionFeedback)}
                </span>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                  Budget category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Food">Food 🍔</option>
                  <option value="Rent">Rent 🏠</option>
                  <option value="Transport">Transport 🚲</option>
                  <option value="Tech">Tech 💻</option>
                  <option value="Entertainment">Entertainment 🎬</option>
                  <option value="Investments">Investments 📈</option>
                  <option value="Utilities">Utilities 💡</option>
                  <option value="Other">Other 🏷️</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                  Booking date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-xs py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Post to Ledgers
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filter and Metrics Row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-3 rounded-xl flex items-center justify-between space-x-4 shadow-3xs">
        <div className="flex items-center space-x-1.5 min-w-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-[11px] bg-slate-50 dark:bg-slate-950 rounded px-1.5 py-0.5 outline-none font-bold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Rent">Rent</option>
            <option value="Transport">Transport</option>
            <option value="Tech">Tech</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Investments">Investments</option>
            <option value="Utilities">Utilities</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] text-slate-400 dark:text-slate-550 font-mono tracking-wider">TOTAL SUM</p>
          <p className="font-bold font-mono text-sm text-slate-800 dark:text-slate-100 truncate">
            {formatValue(totalFilteredValue)}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
        <AnimatePresence initial={false}>
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense) => (
              <motion.div
                key={expense.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-850 rounded-lg text-lg">
                    {CATEGORY_ICONS[expense.category] || "💸"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {expense.label}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span className="flex items-center font-bold">
                        <Calendar className="w-2.5 h-2.5 mr-0.5 text-slate-400" />
                        {expense.date}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right font-mono">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {formatValue(expense.convertedValue)}
                    </p>
                    {expense.currency !== baseCurrency && (
                      <p className="text-[9px] text-slate-450 dark:text-slate-500 font-medium">
                        Original: {expense.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} {expense.currency}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-1 px-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center select-none bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-medium mt-2">Zero matching records</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-600 font-mono mt-0.5">Hydrate ledger via "+ Add Record"</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFortune } from "../state/FortuneState";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Calendar, TrendingUp, TrendingDown, Landmark, Sparkles, HelpCircle } from "lucide-react";
import { PortfolioAsset } from "../types";

const CRYPTO_ICONS: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  SOL: "☀",
  ADA: "₳",
  DOGE: "Ð",
};

const STOCK_ICONS: Record<string, string> = {
  AAPL: "🍎",
  GOOG: "G",
  MSFT: "田",
  AMZN: "a",
  TSLA: "T",
  NVDA: "N",
};

export const PortfolioTab: React.FC = () => {
  const {
    baseCurrency,
    portfolio,
    prices,
    addAsset,
    deleteAsset,
    convertUSDToBase,
  } = useFortune();

  const [formOpen, setFormOpen] = useState(false);
  
  // Acquisition form state
  const [type, setType] = useState<"crypto" | "stock">("crypto");
  const [symbol, setSymbol] = useState("BTC");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().substring(0, 10));

  // Auto-switch symbol list on type change
  useEffect(() => {
    if (type === "crypto") {
      setSymbol("BTC");
    } else {
      setSymbol("AAPL");
    }
  }, [type]);

  // Keep track of previous prices to trigger modest visual up/down ticks!
  const prevPricesRef = useRef<Record<string, number>>({});
  const [flashStates, setFlashStates] = useState<Record<string, "up" | "down" | null>>({});

  useEffect(() => {
    const currentPriceMap: Record<string, number> = {};
    
    // Combine stocks & cryptos to look up
    Object.entries(prices.crypto).forEach(([k, v]) => { currentPriceMap[k] = v as number; });
    Object.entries(prices.stocks).forEach(([k, v]) => { currentPriceMap[k] = v as number; });

    const newFlashes: Record<string, "up" | "down" | null> = {};
    let hasChanges = false;

    Object.entries(currentPriceMap).forEach(([symbol, currentPrice]) => {
      const prevPrice = prevPricesRef.current[symbol];
      if (prevPrice !== undefined && prevPrice !== currentPrice) {
        newFlashes[symbol] = currentPrice > prevPrice ? "up" : "down";
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFlashStates(prev => ({ ...prev, ...newFlashes }));
      
      // Expire flashes after 1.8 seconds
      const timer = setTimeout(() => {
        setFlashStates({});
      }, 1800);
      return () => clearTimeout(timer);
    }

    prevPricesRef.current = currentPriceMap;
  }, [prices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const buy = parseFloat(buyPrice);
    if (isNaN(qty) || qty <= 0 || isNaN(buy) || buy <= 0) return;

    addAsset({
      symbol,
      type,
      quantity: qty,
      buyPrice: buy,
      date,
    });

    // Reset Form
    setQuantity("");
    setBuyPrice("");
    setFormOpen(false);
  };

  // Portfolio total stats
  const stats = useMemo(() => {
    let totalInvestedBase = 0;
    let totalCurrentWorthBase = 0;

    portfolio.forEach(asset => {
      const livePrice = asset.type === "crypto" 
        ? prices.crypto[asset.symbol] || asset.currentPrice
        : prices.stocks[asset.symbol] || asset.currentPrice;

      const investedUSD = asset.quantity * asset.buyPrice;
      const worthUSD = asset.quantity * livePrice;

      totalInvestedBase += convertUSDToBase(investedUSD);
      totalCurrentWorthBase += convertUSDToBase(worthUSD);
    });

    const netProfitBase = totalCurrentWorthBase - totalInvestedBase;
    const profitPercent = totalInvestedBase > 0 ? (netProfitBase / totalInvestedBase) * 100 : 0;

    return {
      totalInvestedBase,
      totalCurrentWorthBase,
      netProfitBase,
      profitPercent,
    };
  }, [portfolio, prices, convertUSDToBase]);

  // Formatter helpers
  const formatBase = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: baseCurrency,
    }).format(amount);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Render individual portfolio holding card with live metrics
  const renderedHoldings = useMemo(() => {
    return portfolio.map(asset => {
      const livePrice = asset.type === "crypto"
        ? prices.crypto[asset.symbol] || asset.currentPrice
        : prices.stocks[asset.symbol] || asset.currentPrice;

      const totalInvestedUSD = asset.quantity * asset.buyPrice;
      const totalWorthUSD = asset.quantity * livePrice;

      const totalInvestedBase = convertUSDToBase(totalInvestedUSD);
      const totalWorthBase = convertUSDToBase(totalWorthUSD);

      const netProfitUSD = totalWorthUSD - totalInvestedUSD;
      const profitPercent = asset.buyPrice > 0 ? (netProfitUSD / totalInvestedUSD) * 100 : 0;

      const isProfit = netProfitUSD >= 0;
      const flash = flashStates[asset.symbol];

      return {
        ...asset,
        livePrice,
        totalInvestedBase,
        totalWorthBase,
        profitPercent,
        isProfit,
        flash,
      };
    });
  }, [portfolio, prices, convertUSDToBase, flashStates]);

  return (
    <div id="fn-portfolio-tab" className="space-y-4 px-1 py-1">
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Asset Registrations
          </span>
          <h2 className="text-[23px] font-medium font-display tracking-wide text-slate-900 dark:text-slate-100 italic capitalize">
            Portfolio Vaults
          </h2>
        </div>
        <button
          onClick={() => setFormOpen(prev => !prev)}
          className="flex items-center space-x-1 py-1.5 px-3 rounded-full text-xs font-bold bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-100/55 hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{formOpen ? "Dismiss" : "Acquire Asset"}</span>
        </button>
      </div>

      {/* Creation form */}
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                  Asset Sector
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200/40 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setType("crypto")}
                    className={`flex-1 rounded-md text-center py-1.5 text-xs font-bold transition-all cursor-pointer ${type === "crypto" ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-550 hover:text-slate-805'}`}
                  >
                    Crypto
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("stock")}
                    className={`flex-1 rounded-md text-center py-1.5 text-xs font-bold transition-all cursor-pointer ${type === "stock" ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-550 hover:text-slate-805'}`}
                  >
                    Equities
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-505 mb-1">
                  Asset Ticker
                </label>
                <select
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500 cursor-pointer"
                >
                  {type === "crypto" ? (
                    <>
                      <option value="BTC">BTC (Bitcoin) ₿</option>
                      <option value="ETH">ETH (Ethereum) Ξ</option>
                      <option value="SOL">SOL (Solana) ☀</option>
                      <option value="ADA">ADA (Cardano) ₳</option>
                      <option value="DOGE">DOGE (Dogecoin) Ð</option>
                    </>
                  ) : (
                    <>
                      <option value="AAPL">AAPL (Apple) 🍎</option>
                      <option value="GOOG">GOOG (Alphabet) G</option>
                      <option value="MSFT">MSFT (Microsoft) 田</option>
                      <option value="AMZN">AMZN (Amazon) a</option>
                      <option value="TSLA">TSLA (Tesla) T</option>
                      <option value="NVDA">NVDA (NVIDIA) N</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                  Quantity owned
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="0.00001"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  placeholder="e.g., 0.45, 15"
                  className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2.5 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                  Cost per unit (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2.5 text-slate-400 text-xs font-mono">$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    value={buyPrice}
                    onChange={e => setBuyPrice(e.target.value)}
                    placeholder="e.g. 59000.00"
                    className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2.5 pl-7 outline-none border border-slate-200 dark:border-slate-800 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono text-slate-400 dark:text-slate-500 mb-1">
                Acquisition date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 dark:text-slate-100 rounded-lg p-2 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full text-xs py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              Log Position to Vault
            </button>
          </motion.form>
        )}
      </AnimatePresence>
      {/* Global Net Value Performance Overview card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 p-4 rounded-xl space-y-3 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-505 uppercase tracking-wider font-mono">
            Vault Performance
          </span>
          <div className={`text-xs font-extrabold flex items-center space-x-1 font-mono ${stats.netProfitBase >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
            {stats.netProfitBase >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 mr-1 text-rose-500" />}
            <span>{stats.netProfitBase >= 0 ? "+" : ""}{stats.profitPercent.toFixed(2)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">TOTAL WORTH</p>
            <p className="font-extrabold font-mono text-base text-slate-850 dark:text-slate-100 mt-0.5">
              {formatBase(stats.totalCurrentWorthBase)}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">ESTIMATED GAINS</p>
            <p className={`font-extrabold font-mono text-base mt-0.5 ${stats.netProfitBase >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
              {stats.netProfitBase >= 0 ? "+" : ""}{formatBase(stats.netProfitBase)}
            </p>
          </div>
        </div>
      </div>

      {/* Vault holding positions list */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
        <AnimatePresence initial={false}>
          {renderedHoldings.length > 0 ? (
            renderedHoldings.map((asset) => (
              <motion.div
                key={asset.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`border rounded-xl p-3 flex items-center justify-between transition-all shadow-3xs hover:border-slate-350 dark:hover:border-slate-700 ${
                  asset.flash === "up" ? "flash-pulse-up border-emerald-500/50 bg-emerald-50/5" : 
                  asset.flash === "down" ? "flash-pulse-down border-rose-500/50 bg-rose-50/5" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-805"
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-slate-50 dark:bg-slate-850 rounded-lg text-sm font-extrabold font-mono text-slate-600 dark:text-slate-300">
                    {asset.type === "crypto" ? CRYPTO_ICONS[asset.symbol] || "🪙" : STOCK_ICONS[asset.symbol] || "📈"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-850 dark:text-slate-100 flex items-center gap-1.5 label-symbol">
                      {asset.symbol} <span className="text-[7.5px] font-mono px-1 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-455 font-bold uppercase tracking-wide">{asset.type}</span>
                    </p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      x{asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 5 })} • Bought: {formatUSD(asset.buyPrice)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <div className="text-right font-mono">
                    <p className="text-xs font-extrabold text-slate-850 dark:text-slate-100">
                      {formatBase(asset.totalWorthBase)}
                    </p>
                    <div className="flex items-center justify-end space-x-1 mt-0.5 text-[9.5px]">
                      {/* Live flashing current unit rate feedback */}
                      <span className={`font-semibold transition-colors duration-200 ${
                        asset.flash === "up" ? "text-emerald-500 font-bold" :
                        asset.flash === "down" ? "text-rose-500 font-bold" : "text-slate-500 dark:text-slate-400"
                      }`}>
                        {formatUSD(asset.livePrice)}
                      </span>
                      <span className="text-slate-250 dark:text-slate-800">|</span>
                      <span className={`font-extrabold ${asset.isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {asset.isProfit ? "+" : ""}{asset.profitPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-1 px-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-955/35 text-rose-500 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center select-none bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-805 rounded-2xl">
              <Landmark className="w-8 h-8 text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-medium mt-2">Zero active assets enrolled</p>
              <p className="text-[9px] text-slate-400 dark:text-slate-600 font-mono mt-0.5">Hydrate list via "+ Acquire Asset"</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

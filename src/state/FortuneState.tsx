import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Expense, PortfolioAsset, LivePrices, SystemStatus, ConnectedAccount, UserSettings, AppUser } from "../types";

// Business interface for state and available actions
interface FortuneContextType {
  baseCurrency: string;
  expenses: Expense[];
  portfolio: PortfolioAsset[];
  prices: LivePrices;
  status: SystemStatus;
  
  // Auth state
  user: AppUser | null;
  settings: UserSettings;
  loginUser: (email: string) => Promise<void>;
  logoutUser: () => void;
  
  // Wallet / Card Payment integration mechanics
  connectAccount: (account: Omit<ConnectedAccount, "id" | "status" | "lastSynced">) => Promise<void>;
  disconnectAccount: (id: string) => void;
  syncAccountPayments: (id: string) => Promise<void>;
  
  // State Action Notifiers
  addExpense: (expense: Omit<Expense, "id" | "convertedValue">) => void;
  deleteExpense: (id: string) => void;
  addAsset: (asset: Omit<PortfolioAsset, "id" | "currentPrice">) => void;
  deleteAsset: (id: string) => void;
  setBaseCurrency: (currency: string) => void;
  triggerManualSync: () => Promise<void>;
  getAIInsights: () => Promise<string>;
  updateSettings: (settings: Partial<UserSettings>) => void;
  
  // Calculation helpers
  convertUSDToBase: (usdAmount: number) => number;
  convertValueBetween: (amount: number, from: string, to: string) => number;
  getExpenseBaseTotal: () => number;
  getPortfolioBaseTotal: () => number;
  getCombinedCapitalNet: () => number;
}

const FortuneContext = createContext<FortuneContextType | undefined>(undefined);

const DEFAULT_PRICES: LivePrices = {
  forex: {
    USD: 1.00,
    EUR: 0.92,
    GBP: 0.78,
    JPY: 156.40,
    CAD: 1.37,
    AUD: 1.51,
    NGN: 1450.00,
  },
  crypto: {
    BTC: 68500.00,
    ETH: 3820.00,
    SOL: 164.50,
    ADA: 0.46,
    DOGE: 0.14,
  },
  stocks: {
    AAPL: 189.50,
    GOOG: 173.80,
    MSFT: 429.20,
    AMZN: 181.10,
    TSLA: 178.60,
    NVDA: 1060.00,
  },
};

const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  hapticFeedback: true,
  soundEffects: true,
  optimisticUI: true,
  simulateOffline: false,
};

const INITIAL_ACCOUNTS: ConnectedAccount[] = [
  {
    id: "acc_paypal",
    type: "paypal",
    name: "Business PayPal Verified",
    details: "joelasuelimen12@gmail.com",
    balance: 2450.50,
    currency: "USD",
    status: "connected",
    lastSynced: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: "acc_visa",
    type: "visa",
    name: "Chase Sapphire Preferred",
    details: "Visa •••• 9012",
    balance: 14500.00,
    currency: "USD",
    status: "connected",
    lastSynced: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    id: "acc_crypto",
    type: "crypto_wallet",
    name: "MetaMask Central hotwallet",
    details: "0xec2f...b3a1",
    balance: 8904.20,
    currency: "USD",
    status: "connected",
    lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
];

export const FortuneStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- BASE STATES ---
  const [baseCurrency, setBaseCurrencyState] = useState<string>(() => {
    return localStorage.getItem("fn_base_currency") || "USD";
  });

  const [prices, setPrices] = useState<LivePrices>(() => {
    const cached = localStorage.getItem("fn_cached_prices");
    return cached ? JSON.parse(cached) : DEFAULT_PRICES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem("fn_cached_expenses");
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>(() => {
    const cached = localStorage.getItem("fn_cached_portfolio");
    if (cached) return JSON.parse(cached);
    return [];
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const cached = localStorage.getItem("fn_settings");
    return cached ? { ...DEFAULT_SETTINGS, ...JSON.parse(cached) } : DEFAULT_SETTINGS;
  });

  const [user, setUser] = useState<AppUser | null>(() => {
    const cached = localStorage.getItem("fn_user_profile");
    return cached ? JSON.parse(cached) : null;
  });

  const [status, setStatus] = useState<SystemStatus>(() => ({
    isOffline: false,
    isSyncing: false,
    lastUpdated: Date.now(),
    logs: ["Systems initialized. Offline-first engine ready."],
  }));

  const addLog = useCallback((logMsg: string) => {
    const formatted = `[${new Date().toLocaleTimeString()}] ${logMsg}`;
    setStatus(prev => ({
      ...prev,
      logs: [formatted, ...prev.logs.slice(0, 49)]
    }));
  }, []);

  // --- THEME SYNC UTILITY ---
  useEffect(() => {
    const root = document.documentElement;
    // Clear any previous theme classes
    root.classList.remove("dark", "light", "nord", "cyberpunk", "emerald");
    
    // Add new ones
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.add("light");
    } else {
      // Custom themes: nord, cyberpunk, emerald are also dark-centric/stylized or color-specific
      root.classList.add(settings.theme);
      // nord, cyberpunk, emerald should activate dark classes where appropriate
      if (settings.theme !== "light") {
        root.classList.add("dark");
      }
    }
  }, [settings.theme]);

  // Audio trigger helper for perfect premium auditory feedback
  const playFx = useCallback((type: "tap" | "success" | "error" | "delete") => {
    if (!settings.soundEffects) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === "tap") {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === "delete") {
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (_) {}
  }, [settings.soundEffects]);

  // Haptics simulation (vibration API when open inside a mobile screen / physical test tabs)
  const triggerHaptic = useCallback((strength: "light" | "medium" | "heavy") => {
    if (!settings.hapticFeedback) return;
    if ("vibrate" in navigator) {
      if (strength === "light") navigator.vibrate(12);
      else if (strength === "medium") navigator.vibrate(25);
      else if (strength === "heavy") navigator.vibrate(45);
    }
  }, [settings.hapticFeedback]);

  // --- MATHEMATICAL / FX CONVERSION ENGINES ---
  const convertValueBetween = useCallback((amount: number, from: string, to: string) => {
    const forex = prices.forex;
    const rateFrom = forex[from] || DEFAULT_PRICES.forex[from] || 1;
    const rateTo = forex[to] || DEFAULT_PRICES.forex[to] || 1;
    return (amount / rateFrom) * rateTo;
  }, [prices]);

  const convertUSDToBase = useCallback((usdAmount: number) => {
    return usdAmount * (prices.forex[baseCurrency] || 1);
  }, [prices, baseCurrency]);

  const reevaluateConversions = useCallback((currentExpenses: Expense[], currentPrices: LivePrices, currentBase: string): Expense[] => {
    return currentExpenses.map(item => {
      const forex = currentPrices.forex;
      const rateFrom = forex[item.currency] || DEFAULT_PRICES.forex[item.currency] || 1;
      const rateTo = forex[currentBase] || DEFAULT_PRICES.forex[currentBase] || 1;
      const usdVal = item.value / rateFrom;
      return {
        ...item,
        convertedValue: Number((usdVal * rateTo).toFixed(2)),
      };
    });
  }, []);

  // --- RESILIENT SYNC UTILITIES ---
  const syncData = useCallback(async (isSilent = true) => {
    // If user enforces offline mode in settings, skip fetching and act as offline instantly
    if (settings.simulateOffline) {
      setStatus(prev => ({
        ...prev,
        isOffline: true,
        isSyncing: false,
      }));
      return;
    }

    if (!isSilent) {
      setStatus(prev => ({ ...prev, isSyncing: true }));
    }
    
    try {
      const response = await fetch("/api/prices");
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      const payload = await response.json();
      if (payload.status === "ok" && payload.prices) {
        const freshPrices = payload.prices as LivePrices;
        setPrices(freshPrices);
        localStorage.setItem("fn_cached_prices", JSON.stringify(freshPrices));

        setPortfolio(prev => {
          const updated = prev.map(asset => {
            const livePrice = asset.type === "crypto" 
              ? freshPrices.crypto[asset.symbol] 
              : freshPrices.stocks[asset.symbol];
            return {
              ...asset,
              currentPrice: livePrice || asset.currentPrice
            };
          });
          localStorage.setItem("fn_cached_portfolio", JSON.stringify(updated));
          return updated;
        });

        setStatus(prev => ({
          ...prev,
          isOffline: false,
          isSyncing: false,
          lastUpdated: Date.now()
        }));
      }
    } catch (error: any) {
      console.warn("Syncer network connection glitch:", error);
      setStatus(prev => ({
        ...prev,
        isOffline: true,
        isSyncing: false,
      }));
    }
  }, [settings.simulateOffline]);

  // Recalculates converted values whenever currency, base rates, or expense items change
  useEffect(() => {
    setExpenses(prev => {
      const updated = reevaluateConversions(prev, prices, baseCurrency);
      localStorage.setItem("fn_cached_expenses", JSON.stringify(updated));
      return updated;
    });
  }, [baseCurrency, prices, reevaluateConversions]);

  // Background ticker running prices sync
  useEffect(() => {
    syncData(false);
    const intervalId = setInterval(() => {
      syncData(true);
    }, 12000);
    return () => clearInterval(intervalId);
  }, [syncData]);

  // --- USER AUTH FLOW ---
  const loginUser = useCallback(async (email: string): Promise<void> => {
    playFx("tap");
    addLog(`Operator authentication sequence initiated for <${email}>`);
    
    // Simulate high-security handshakes
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Optimistic profile creation
    const profile: AppUser = {
      email,
      connectedAccounts: INITIAL_ACCOUNTS, // Seeding 3 beautiful active accounts as user requested
      settings: settings,
    };
    
    setUser(profile);
    localStorage.setItem("fn_user_profile", JSON.stringify(profile));
    
    // Seed initial demo expenses and assets if local storage is fresh
    const cachedExp = localStorage.getItem("fn_cached_expenses");
    if (!cachedExp) {
      const demoExpenses: Expense[] = [
        { id: "e1", label: "AWS Cloud Infrastructure", category: "Tech", value: 120, currency: "USD", date: "2026-05-28", convertedValue: 120 },
        { id: "e2", label: "Central Berlin Workspace", category: "Rent", value: 1450, currency: "EUR", date: "2026-05-01", convertedValue: 1576 },
        { id: "e3", label: "Uber Commutes - London Node", category: "Transport", value: 65, currency: "GBP", date: "2026-05-30", convertedValue: 83.33 },
      ];
      setExpenses(demoExpenses);
      localStorage.setItem("fn_cached_expenses", JSON.stringify(demoExpenses));
    }

    const cachedPort = localStorage.getItem("fn_cached_portfolio");
    if (!cachedPort) {
      const demoPortfolio: PortfolioAsset[] = [
        { id: "p1", symbol: "BTC", type: "crypto", quantity: 0.35, buyPrice: 58100, currentPrice: 68500.00, date: "2026-02-12" },
        { id: "p2", symbol: "SOL", type: "crypto", quantity: 24.5, buyPrice: 95, currentPrice: 164.50, date: "2026-03-05" },
        { id: "p3", symbol: "AAPL", type: "stock", quantity: 15, buyPrice: 168.4, currentPrice: 189.50, date: "2026-01-20" },
      ];
      setPortfolio(demoPortfolio);
      localStorage.setItem("fn_cached_portfolio", JSON.stringify(demoPortfolio));
    }

    playFx("success");
    triggerHaptic("heavy");
    addLog(`Authentication successful. Live payment integrations linked.`);
  }, [settings, addLog, playFx, triggerHaptic]);

  const logoutUser = useCallback(() => {
    playFx("delete");
    addLog("Operator logged out. Local vault data remains secure.");
    setUser(null);
    localStorage.removeItem("fn_user_profile");
    triggerHaptic("medium");
  }, [addLog, playFx, triggerHaptic]);

  // --- CONNECTED ACCOUNTS / WALLETS INTEGRATION (PayPal, Card, Crypto Wallets) ---
  const connectAccount = useCallback(async (accountData: Omit<ConnectedAccount, "id" | "status" | "lastSynced">) => {
    const id = "acc_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const newAcct: ConnectedAccount = {
      ...accountData,
      id,
      status: "syncing",
      lastSynced: "Just now"
    };

    playFx("tap");
    addLog(`Initiating payment integration connection to ${accountData.name}...`);

    // --- OPTIMISTIC UI UPDATE ---
    // Instantly append the card/wallet in an active "syncing" or loading state in the local state.
    if (user) {
      const updatedUser: AppUser = {
        ...user,
        connectedAccounts: [...user.connectedAccounts, newAcct]
      };
      setUser(updatedUser);
      localStorage.setItem("fn_user_profile", JSON.stringify(updatedUser));
    }

    // --- NETWORK RESILIENCY PROTOCOL ---
    // We execute a background link timer. If simulateOffline is check-marked, or the user is offline,
    // we handle the connection fallback elegantly by transitioning the state to "error" with automated logs.
    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (settings.simulateOffline) {
            reject(new Error("Connection timeout: Bank endpoints unreachable."));
          } else {
            resolve(true);
          }
        }, 1600);
      });

      // On successful authorization handshakes, progress the state to "connected"
      if (user) {
        setUser(currentUser => {
          if (!currentUser) return null;
          const finishedAccts = currentUser.connectedAccounts.map(acct => {
            if (acct.id === id) {
              return {
                ...acct,
                status: "connected" as const,
                lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
            }
            return acct;
          });
          const updated = { ...currentUser, connectedAccounts: finishedAccts };
          localStorage.setItem("fn_user_profile", JSON.stringify(updated));
          return updated;
        });
      }

      addLog(`Payment integration secure link established for: ${accountData.name}`);
      playFx("success");
      triggerHaptic("heavy");
    } catch (e: any) {
      // Graceful error state with retry opportunity
      if (user) {
        setUser(currentUser => {
          if (!currentUser) return null;
          const failedAccts = currentUser.connectedAccounts.map(acct => {
            if (acct.id === id) {
              return {
                ...acct,
                status: "error" as const,
                lastSynced: "Sync failed"
              };
            }
            return acct;
          });
          const updated = { ...currentUser, connectedAccounts: failedAccts };
          localStorage.setItem("fn_user_profile", JSON.stringify(updated));
          return updated;
        });
      }
      addLog(`Resiliency Action: Failed secure sync with ${accountData.name}. ${e.message}`);
      playFx("error");
      triggerHaptic("medium");
    }
  }, [user, settings.simulateOffline, addLog, playFx, triggerHaptic]);

  const disconnectAccount = useCallback((id: string) => {
    if (!user) return;
    playFx("delete");
    const filtered = user.connectedAccounts.filter(a => a.id !== id);
    const updated = { ...user, connectedAccounts: filtered };
    setUser(updated);
    localStorage.setItem("fn_user_profile", JSON.stringify(updated));
    addLog("Unlinked payment wallet account to restrict tracking permissions.");
    triggerHaptic("medium");
  }, [user, addLog, playFx, triggerHaptic]);

  const syncAccountPayments = useCallback(async (id: string) => {
    if (!user) return;
    playFx("tap");
    addLog("Requesting hot ledger reconciliation from clearinghouse...");

    setUser(currentUser => {
      if (!currentUser) return null;
      const syncingAccts = currentUser.connectedAccounts.map(acct => {
        if (acct.id === id) {
          return { ...acct, status: "syncing" as const };
        }
        return acct;
      });
      return { ...currentUser, connectedAccounts: syncingAccts };
    });

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (settings.simulateOffline) reject(new Error("Handshake timeout"));
          else resolve(true);
        }, 1100);
      });

      setUser(currentUser => {
        if (!currentUser) return null;
        const linkedAccts = currentUser.connectedAccounts.map(acct => {
          if (acct.id === id) {
            // slightly fluctuate account balances to reflect mock live credit transactions/charges
            const flux = (Math.random() - 0.45) * 50; 
            return {
              ...acct,
              status: "connected" as const,
              balance: Number(Math.max(10, acct.balance + flux).toFixed(2)),
              lastSynced: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          }
          return acct;
        });
        const updated = { ...currentUser, connectedAccounts: linkedAccts };
        localStorage.setItem("fn_user_profile", JSON.stringify(updated));
        return updated;
      });

      addLog("Account metrics updated from secure nodes successfully.");
      playFx("success");
      triggerHaptic("light");
    } catch (_) {
      setUser(currentUser => {
        if (!currentUser) return null;
        const errorAccts = currentUser.connectedAccounts.map(acct => {
          if (acct.id === id) {
            return { ...acct, status: "error" as const };
          }
          return acct;
        });
        return { ...currentUser, connectedAccounts: errorAccts };
      });
      addLog("Connection failed. Researched network path for route retry...");
      playFx("error");
    }
  }, [user, settings.simulateOffline, addLog, playFx, triggerHaptic]);

  // --- ACTIONS (EXPENSES & PORTFOLIO) ---
  const addExpense = useCallback((data: Omit<Expense, "id" | "convertedValue">) => {
    const id = "exp_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    playFx("tap");

    // Optimistic addition
    setExpenses(prev => {
      const newItem: Expense = {
        ...data,
        id,
        convertedValue: 0
      };
      const updated = reevaluateConversions([...prev, newItem], prices, baseCurrency);
      localStorage.setItem("fn_cached_expenses", JSON.stringify(updated));
      addLog(`Expense added: ${data.label} [${data.value} ${data.currency}]`);
      return updated;
    });

    triggerHaptic("medium");
  }, [baseCurrency, prices, reevaluateConversions, addLog, playFx, triggerHaptic]);

  const deleteExpense = useCallback((id: string) => {
    playFx("delete");
    setExpenses(prev => {
      const match = prev.find(e => e.id === id);
      const filtered = prev.filter(e => e.id !== id);
      localStorage.setItem("fn_cached_expenses", JSON.stringify(filtered));
      if (match) {
        addLog(`Expense deleted: ${match.label}`);
      }
      return filtered;
    });
    triggerHaptic("light");
  }, [addLog, playFx, triggerHaptic]);

  const addAsset = useCallback((data: Omit<PortfolioAsset, "id" | "currentPrice">) => {
    const id = "ast_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    playFx("tap");

    setPortfolio(prev => {
      const livePrice = data.type === "crypto" 
        ? prices.crypto[data.symbol] || DEFAULT_PRICES.crypto[data.symbol] || 0
        : prices.stocks[data.symbol] || DEFAULT_PRICES.stocks[data.symbol] || 0;
      
      const newAsset: PortfolioAsset = {
        ...data,
        id,
        currentPrice: livePrice
      };
      const updated = [...prev, newAsset];
      localStorage.setItem("fn_cached_portfolio", JSON.stringify(updated));
      addLog(`Asset acquired: ${data.symbol} [x${data.quantity}]`);
      return updated;
    });

    triggerHaptic("medium");
  }, [prices, addLog, playFx, triggerHaptic]);

  const deleteAsset = useCallback((id: string) => {
    playFx("delete");
    setPortfolio(prev => {
      const match = prev.find(a => a.id === id);
      const filtered = prev.filter(a => a.id !== id);
      localStorage.setItem("fn_cached_portfolio", JSON.stringify(filtered));
      if (match) {
        addLog(`Asset removed: ${match.symbol}`);
      }
      return filtered;
    });
    triggerHaptic("light");
  }, [addLog, playFx, triggerHaptic]);

  const setBaseCurrency = useCallback((currency: string) => {
    playFx("tap");
    setBaseCurrencyState(currency);
    localStorage.setItem("fn_base_currency", currency);
    addLog(`Switched base currency context to ${currency}. All conversion layers recalculated.`);
    triggerHaptic("light");
  }, [addLog, playFx, triggerHaptic]);

  const triggerManualSync = useCallback(async () => {
    playFx("tap");
    addLog("Manual sync command dispatched.");
    await syncData(false);
    triggerHaptic("heavy");
  }, [syncData, addLog, playFx, triggerHaptic]);

  const getAIInsights = useCallback(async (): Promise<string> => {
    addLog("Transmitting encrypted context state to Fortune Advisor...");
    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenses,
          portfolio,
          quoteCurrency: baseCurrency,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      addLog("Fortune Navigator AI Advisory context analysis complete.");
      return data.analysis;
    } catch (e: any) {
      addLog(`AI Diagnostic stream failed: ${e.message}`);
      throw e;
    }
  }, [expenses, portfolio, baseCurrency, addLog]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    playFx("tap");
    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      localStorage.setItem("fn_settings", JSON.stringify(next));
      addLog(`System setting modified: ${Object.keys(newSettings).join(", ")}`);
      return next;
    });
    triggerHaptic("light");
  }, [addLog, playFx, triggerHaptic]);

  // --- CALCULATION GRAND TOTALS (Optimistically derived) ---
  const getExpenseBaseTotal = useCallback(() => {
    return expenses.reduce((sum, e) => sum + e.convertedValue, 0);
  }, [expenses]);

  const getPortfolioBaseTotal = useCallback(() => {
    // Combine standard manual assets & connected balances (automatically converted from USD)
    const manualTotal = portfolio.reduce((sum, asset) => {
      const valueInUSD = asset.quantity * asset.currentPrice;
      return sum + convertUSDToBase(valueInUSD);
    }, 0);

    const connectedTotalUSD = user?.connectedAccounts
      .filter(a => a.status === "connected")
      .reduce((sum, acct) => sum + acct.balance, 0) || 0;

    return manualTotal + convertUSDToBase(connectedTotalUSD);
  }, [portfolio, convertUSDToBase, user]);

  const getCombinedCapitalNet = useCallback(() => {
    return getPortfolioBaseTotal() - getExpenseBaseTotal();
  }, [getPortfolioBaseTotal, getExpenseBaseTotal]);

  return (
    <FortuneContext.Provider
      value={{
        baseCurrency,
        expenses,
        portfolio,
        prices,
        status,
        user,
        settings,
        loginUser,
        logoutUser,
        connectAccount,
        disconnectAccount,
        syncAccountPayments,
        addExpense,
        deleteExpense,
        addAsset,
        deleteAsset,
        setBaseCurrency,
        triggerManualSync,
        getAIInsights,
        updateSettings,
        convertUSDToBase,
        convertValueBetween,
        getExpenseBaseTotal,
        getPortfolioBaseTotal,
        getCombinedCapitalNet,
      }}
    >
      {children}
    </FortuneContext.Provider>
  );
};

export const useFortune = () => {
  const context = useContext(FortuneContext);
  if (context === undefined) {
    throw new Error("useFortune must be used inside FortuneStateProvider");
  }
  return context;
};

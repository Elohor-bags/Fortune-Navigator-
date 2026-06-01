export interface Expense {
  id: string;
  label: string;
  category: "Food" | "Rent" | "Transport" | "Tech" | "Entertainment" | "Investments" | "Utilities" | "Other";
  value: number; // Original value
  currency: string; // Original currency, e.g., 'USD', 'EUR', 'NGN'
  date: string; // ISO string or YYYY-MM-DD
  convertedValue: number; // Converted value into the primary base quote currency
}

export interface PortfolioAsset {
  id: string;
  symbol: string; // e.g., 'BTC', 'AAPL'
  type: "crypto" | "stock";
  quantity: number;
  buyPrice: number; // In base asset currency (usually USD or converted)
  currentPrice: number; // Current live price (in USD from server tracker)
  date: string;
}

export interface LivePrices {
  forex: Record<string, number>;
  crypto: Record<string, number>;
  stocks: Record<string, number>;
}

export interface SystemStatus {
  isOffline: boolean;
  isSyncing: boolean;
  lastUpdated: number; // Timestamp
  logs: string[];
}

export interface ConnectedAccount {
  id: string;
  type: "paypal" | "visa" | "mastercard" | "crypto_wallet";
  name: string; // e.g., 'Primary PayPal', 'Gold MasterCard', 'Metamask ETH'
  details: string; // e.g., email / masked numbers / public addresses
  balance: number; // Current tracked amount in USD
  currency: string; // Account-specific currency (converted layout later)
  status: "connected" | "syncing" | "error";
  lastSynced: string;
}

export interface UserSettings {
  theme: "light" | "dark" | "nord" | "cyberpunk" | "emerald";
  hapticFeedback: boolean;
  soundEffects: boolean;
  optimisticUI: boolean;
  simulateOffline: boolean;
}

export interface AppUser {
  email: string;
  connectedAccounts: ConnectedAccount[];
  settings: UserSettings;
}

export type AppTab = "home" | "expenses" | "portfolio" | "advisor";

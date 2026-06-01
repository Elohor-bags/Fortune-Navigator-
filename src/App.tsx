/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FortuneStateProvider, useFortune } from "./state/FortuneState";
import { DeviceShell } from "./components/DeviceShell";
import { Dashboard } from "./components/Dashboard";
import { ExpensesTab } from "./components/ExpensesTab";
import { PortfolioTab } from "./components/PortfolioTab";
import { AdvisorTab } from "./components/AdvisorTab";
import { LoginScreen } from "./components/LoginScreen";
import { AppTab } from "./types";

function AppContent() {
  const { user } = useFortune();
  const [activeTab, setActiveTab] = useState<AppTab>("home");

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <DeviceShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "home" && <Dashboard onNavigate={setActiveTab} />}
      {activeTab === "expenses" && <ExpensesTab />}
      {activeTab === "portfolio" && <PortfolioTab />}
      {activeTab === "advisor" && <AdvisorTab />}
    </DeviceShell>
  );
}

export default function App() {
  return (
    <FortuneStateProvider>
      <AppContent />
    </FortuneStateProvider>
  );
}

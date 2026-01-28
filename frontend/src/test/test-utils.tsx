/**
 * Test Utilities
 *
 * Custom render function that wraps components with all necessary providers.
 * Use this instead of @testing-library/react render for components that need:
 * - next-intl translations
 * - Theme provider
 * - Other context providers
 */

import React from "react";
import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

// Default messages for testing
const defaultMessages = {
  nav: {
    overview: "Overview",
    strategies: "Strategies",
    trading: "Trading",
    risk: "Risk",
    backtest: "Backtest",
    copy: "Copy Trading",
    settings: "Settings",
    alerts: "Alerts",
  },
  trading: {
    recentTrades: "Recent Trades",
    cancelOrder: "Cancel",
    buy: "Buy",
    sell: "Sell",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    orders: "Orders",
    orderBook: "Order Book",
    openPositions: "Open Positions",
    positionValue: "Position Value",
    modify: "Modify",
    closePosition: "Close Position",
    closing: "Closing...",
    unrealizedPnl: "Unrealized P&L",
    entryPrice: "Entry Price",
    currentPrice: "Current Price",
    stopLoss: "Stop Loss",
    takeProfit: "Take Profit",
    stopPrice: "Stop Price",
    available: "Available",
    timeInForce: "Time in Force",
    submitting: "Submitting...",
    insufficientBalance: "Insufficient balance",
  },
  position: {
    totalPositions: "Total Positions",
    totalValue: "Total Value",
    marginUsed: "Margin Used",
    position: "position",
    positions: "Positions",
    noPositions: "No open positions",
    closePosition: "Close",
    setStopLoss: "Set Stop Loss",
    setTakeProfit: "Set Take Profit",
    longPosition: "Long",
    shortPosition: "Short",
    entryPrice: "Entry Price",
    currentPrice: "Current Price",
    pnl: "Total P&L",
    pnlPercent: "P&L %",
    longShort: "Long/Short",
    leverage: "Leverage",
    stopLoss: "Stop Loss:",
    takeProfit: "Take Profit:",
    notSet: "Not set",
    riskLevel: "Risk Level",
    low: "Low",
    medium: "Medium",
    high: "High",
    modify: "Modify",
  },
  common: {
    loading: "Loading...",
    error: "Error",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
  },
  orderForm: {
    orderType: "Order Type",
    marketOrder: "Market",
    limitOrder: "Limit",
    stopOrder: "Stop",
    stopLimitOrder: "Stop Limit",
    gtcFull: "Good 'Til Cancelled",
    iocFull: "Immediate or Cancel",
    fokFull: "Fill or Kill",
    dayOrder: "Day Order",
    quantityGreaterThanZero: "Quantity must be greater than 0",
    priceGreaterThanZero: "Price must be greater than 0",
    stopPriceGreaterThanZero: "Stop price must be greater than 0",
  },
};

interface WrapperProps {
  children: React.ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <NextIntlClientProvider locale="en" messages={defaultMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Custom render function with providers
 * Use this instead of @testing-library/react render
 */
function customRender(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return rtlRender(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render with custom render
export { customRender as render };

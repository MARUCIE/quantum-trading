import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { PositionManager, PositionSummary, type Position } from "./position-manager";

/**
 * Position Manager Component Tests
 *
 * Tests for position display and management components.
 * Covers P&L calculations, position actions, and risk indicators.
 */

// Mock positions
const mockPositions: Position[] = [
  {
    id: "pos-1",
    symbol: "BTC/USDT",
    side: "long",
    quantity: 0.5,
    entryPrice: 42000,
    currentPrice: 43000,
    stopLoss: 40000,
    takeProfit: 48000,
    openedAt: new Date(Date.now() - 3600000),
    leverage: 5,
  },
  {
    id: "pos-2",
    symbol: "ETH/USDT",
    side: "short",
    quantity: 2.0,
    entryPrice: 2500,
    currentPrice: 2400,
    openedAt: new Date(Date.now() - 7200000),
    leverage: 3,
  },
  {
    id: "pos-3",
    symbol: "SOL/USDT",
    side: "long",
    quantity: 50,
    entryPrice: 100,
    currentPrice: 85, // Losing position
    openedAt: new Date(Date.now() - 86400000),
  },
];

describe("PositionManager", () => {
  describe("Rendering", () => {
    it("should render the component title", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText("Open Positions")).toBeInTheDocument();
    });

    it("should display position count", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText("3 positions")).toBeInTheDocument();
    });

    it("should display singular position count", () => {
      render(<PositionManager positions={[mockPositions[0]]} />);
      expect(screen.getByText("1 position")).toBeInTheDocument();
    });

    it("should display all position symbols", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText("BTC/USDT")).toBeInTheDocument();
      expect(screen.getByText("ETH/USDT")).toBeInTheDocument();
      expect(screen.getByText("SOL/USDT")).toBeInTheDocument();
    });

    it("should display leverage badges", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText("5x")).toBeInTheDocument();
      expect(screen.getByText("3x")).toBeInTheDocument();
    });

    it("should display position quantities and entry prices", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText(/0\.5 @ 42,000/)).toBeInTheDocument();
      expect(screen.getByText(/2 @ 2,500/)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no positions", () => {
      render(<PositionManager positions={[]} />);
      expect(screen.getByText("No open positions")).toBeInTheDocument();
    });

    it("should display 0 positions count", () => {
      render(<PositionManager positions={[]} />);
      expect(screen.getByText("0 positions")).toBeInTheDocument();
    });
  });

  describe("Aggregate Metrics", () => {
    it("should display Total P&L", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText("Total P&L")).toBeInTheDocument();
    });

    it("should display P&L percentage", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText("P&L %")).toBeInTheDocument();
    });

    it("should display Long/Short ratio", () => {
      render(<PositionManager positions={mockPositions} />);
      expect(screen.getByText("Long/Short")).toBeInTheDocument();
      expect(screen.getByText("2/1")).toBeInTheDocument();
    });
  });

  describe("P&L Display", () => {
    it("should show positive P&L in green for profitable long position", () => {
      // BTC position: entry 42000, current 43000, qty 0.5
      // P&L = (43000 - 42000) * 0.5 = +$500
      render(<PositionManager positions={[mockPositions[0]]} />);
      const pnlElements = screen.getAllByText(/\+\$500/);
      expect(pnlElements.length).toBeGreaterThan(0);
    });

    it("should show positive P&L for profitable short position", () => {
      // ETH position: short, entry 2500, current 2400, qty 2
      // P&L = (2500 - 2400) * 2 = +$200
      render(<PositionManager positions={[mockPositions[1]]} />);
      const pnlElements = screen.getAllByText(/\+\$200/);
      expect(pnlElements.length).toBeGreaterThan(0);
    });

    it("should show negative P&L for losing position", () => {
      // SOL position: long, entry 100, current 85, qty 50
      // P&L = (85 - 100) * 50 = $-750
      render(<PositionManager positions={[mockPositions[2]]} />);
      // Format is $-750 (dollar sign before negative)
      const pnlElements = screen.getAllByText(/\$-750/);
      expect(pnlElements.length).toBeGreaterThan(0);
    });
  });

  describe("Position Expansion", () => {
    it("should expand position details on click", async () => {
      const user = userEvent.setup();
      render(<PositionManager positions={mockPositions} />);

      // Click on BTC position row
      const btcRow = screen.getByText("BTC/USDT").closest("div[class*='cursor-pointer']");
      if (btcRow) {
        await user.click(btcRow);
      }

      // Should show expanded details
      expect(screen.getByText("Entry Price")).toBeInTheDocument();
      expect(screen.getByText("Current Price")).toBeInTheDocument();
      expect(screen.getByText("Position Value")).toBeInTheDocument();
    });

    it("should show stop loss and take profit in expanded view", async () => {
      const user = userEvent.setup();
      render(<PositionManager positions={[mockPositions[0]]} />);

      // Click to expand
      const btcRow = screen.getByText("BTC/USDT").closest("div[class*='cursor-pointer']");
      if (btcRow) {
        await user.click(btcRow);
      }

      expect(screen.getByText("Stop Loss:")).toBeInTheDocument();
      expect(screen.getByText("$40,000")).toBeInTheDocument();
      expect(screen.getByText("Take Profit:")).toBeInTheDocument();
      expect(screen.getByText("$48,000")).toBeInTheDocument();
    });

    it("should show Not set for missing SL/TP", async () => {
      const user = userEvent.setup();
      render(<PositionManager positions={[mockPositions[2]]} />); // SOL has no SL/TP

      const solRow = screen.getByText("SOL/USDT").closest("div[class*='cursor-pointer']");
      if (solRow) {
        await user.click(solRow);
      }

      const notSetElements = screen.getAllByText("Not set");
      expect(notSetElements.length).toBe(2); // Both SL and TP
    });

    it("should collapse position on second click", async () => {
      const user = userEvent.setup();
      render(<PositionManager positions={mockPositions} />);

      const btcRow = screen.getByText("BTC/USDT").closest("div[class*='cursor-pointer']");
      if (btcRow) {
        // Expand
        await user.click(btcRow);
        expect(screen.getByText("Entry Price")).toBeInTheDocument();

        // Collapse
        await user.click(btcRow);
        expect(screen.queryByText("Entry Price")).not.toBeInTheDocument();
      }
    });
  });

  describe("Position Actions", () => {
    it("should show Modify and Close buttons when expanded", async () => {
      const user = userEvent.setup();
      render(<PositionManager positions={mockPositions} />);

      const btcRow = screen.getByText("BTC/USDT").closest("div[class*='cursor-pointer']");
      if (btcRow) {
        await user.click(btcRow);
      }

      expect(screen.getByRole("button", { name: /modify/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /close position/i })).toBeInTheDocument();
    });

    it("should call onClosePosition when Close button is clicked", async () => {
      const user = userEvent.setup();
      const onClosePosition = vi.fn().mockResolvedValue(undefined);
      render(<PositionManager positions={mockPositions} onClosePosition={onClosePosition} />);

      // Expand position
      const btcRow = screen.getByText("BTC/USDT").closest("div[class*='cursor-pointer']");
      if (btcRow) {
        await user.click(btcRow);
      }

      // Click close
      const closeButton = screen.getByRole("button", { name: /close position/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(onClosePosition).toHaveBeenCalledWith("pos-1");
      });
    });

    it("should show Closing... while close is in progress", async () => {
      const user = userEvent.setup();
      let resolveClose: () => void;
      const closePromise = new Promise<void>((resolve) => {
        resolveClose = resolve;
      });
      const onClosePosition = vi.fn().mockReturnValue(closePromise);

      render(<PositionManager positions={mockPositions} onClosePosition={onClosePosition} />);

      // Expand and click close
      const btcRow = screen.getByText("BTC/USDT").closest("div[class*='cursor-pointer']");
      if (btcRow) {
        await user.click(btcRow);
      }

      const closeButton = screen.getByRole("button", { name: /close position/i });
      await user.click(closeButton);

      expect(screen.getByText("Closing...")).toBeInTheDocument();

      // Resolve the close
      resolveClose!();
      await waitFor(() => {
        expect(screen.queryByText("Closing...")).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should disable buttons when loading", async () => {
      const user = userEvent.setup();
      render(<PositionManager positions={mockPositions} isLoading={true} />);

      const btcRow = screen.getByText("BTC/USDT").closest("div[class*='cursor-pointer']");
      if (btcRow) {
        await user.click(btcRow);
      }

      expect(screen.getByRole("button", { name: /modify/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /close position/i })).toBeDisabled();
    });
  });

  describe("Risk Indicators", () => {
    it("should show high risk for losing position", () => {
      // SOL is losing 15%, which should be high risk
      render(<PositionManager positions={[mockPositions[2]]} />);
      // Risk indicator should be present (red background)
      const riskIndicator = document.querySelector('[title="high risk"]');
      expect(riskIndicator).toBeInTheDocument();
    });

    it("should show low risk for profitable position", () => {
      render(<PositionManager positions={[mockPositions[0]]} />);
      const riskIndicator = document.querySelector('[title="low risk"]');
      expect(riskIndicator).toBeInTheDocument();
    });
  });
});

describe("PositionSummary", () => {
  describe("Rendering", () => {
    it("should display position count", () => {
      render(<PositionSummary positions={mockPositions} />);
      expect(screen.getByText("Positions")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should display total value", () => {
      render(<PositionSummary positions={mockPositions} />);
      expect(screen.getByText("Total Value")).toBeInTheDocument();
    });

    it("should display margin used", () => {
      render(<PositionSummary positions={mockPositions} />);
      expect(screen.getByText("Margin Used")).toBeInTheDocument();
    });

    it("should display unrealized P&L", () => {
      render(<PositionSummary positions={mockPositions} />);
      expect(screen.getByText("Unrealized P&L")).toBeInTheDocument();
    });
  });

  describe("Calculations", () => {
    it("should calculate correct total value", () => {
      // BTC: 0.5 * 43000 = 21500
      // ETH: 2 * 2400 = 4800
      // SOL: 50 * 85 = 4250
      // Total = 30550
      render(<PositionSummary positions={mockPositions} />);
      expect(screen.getByText("$30,550")).toBeInTheDocument();
    });

    it("should calculate margin with leverage", () => {
      // BTC: 0.5 * 42000 / 5 = 4200
      // ETH: 2 * 2500 / 3 = 1666.67
      // SOL: 50 * 100 / 1 = 5000
      // Total ~ 10867
      render(<PositionSummary positions={mockPositions} />);
      // Check for margin being displayed (exact value may vary due to rounding)
      expect(screen.getByText(/\$10,867/)).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show zeros for empty positions", () => {
      render(<PositionSummary positions={[]} />);
      // Check positions count is 0
      const positionsLabel = screen.getByText("Positions");
      const positionsValue = positionsLabel.nextElementSibling;
      expect(positionsValue?.textContent).toBe("0");
      // Multiple $0 values exist (Total Value, Margin, P&L) - use getAllByText
      const zeroValues = screen.getAllByText("$0");
      expect(zeroValues.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      render(<PositionSummary positions={mockPositions} className="custom-class" />);
      const container = screen.getByText("Positions").closest("div[class*='grid']");
      expect(container?.className).toContain("custom-class");
    });

    it("should show positive P&L in green", () => {
      // Total P&L is negative due to SOL loss
      // Let's use only profitable positions
      render(<PositionSummary positions={[mockPositions[0], mockPositions[1]]} />);
      const pnlElement = screen.getByText(/\+\$700/);
      expect(pnlElement.className).toContain("emerald");
    });
  });
});

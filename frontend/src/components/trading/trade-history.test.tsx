import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TradeHistory, RecentTrades, TradeStats, type Trade } from "./trade-history";

/**
 * Trade History Component Tests
 *
 * Tests for trade display and filtering components.
 * Covers rendering, pagination, and filtering.
 */

// Mock trades
const mockTrades: Trade[] = [
  {
    id: "trade-1",
    symbol: "BTC/USDT",
    side: "buy",
    price: 43000,
    quantity: 0.5,
    total: 21500,
    fee: 0.215,
    feeCurrency: "USDT",
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
  },
  {
    id: "trade-2",
    symbol: "BTC/USDT",
    side: "sell",
    price: 43100,
    quantity: 0.25,
    total: 10775,
    fee: 0.108,
    feeCurrency: "USDT",
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
  },
  {
    id: "trade-3",
    symbol: "ETH/USDT",
    side: "buy",
    price: 2400,
    quantity: 2.0,
    total: 4800,
    fee: 0.048,
    feeCurrency: "USDT",
    timestamp: new Date(Date.now() - 180000), // 3 minutes ago
  },
  {
    id: "trade-4",
    symbol: "SOL/USDT",
    side: "sell",
    price: 95,
    quantity: 10,
    total: 950,
    timestamp: new Date(Date.now() - 240000), // 4 minutes ago
  },
];

describe("TradeHistory", () => {
  describe("Rendering", () => {
    it("should render the component title", () => {
      render(<TradeHistory trades={mockTrades} />);
      expect(screen.getByText("Trade History")).toBeInTheDocument();
    });

    it("should render table headers", () => {
      render(<TradeHistory trades={mockTrades} />);
      expect(screen.getByText("Time")).toBeInTheDocument();
      expect(screen.getByText("Side")).toBeInTheDocument();
      expect(screen.getByText("Price")).toBeInTheDocument();
      expect(screen.getByText("Quantity")).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
      expect(screen.getByText("Fee")).toBeInTheDocument();
    });

    it("should display all trades", () => {
      render(<TradeHistory trades={mockTrades} />);
      // Multiple trades may have Buy/Sell labels
      const buyElements = screen.getAllByText("Buy");
      const sellElements = screen.getAllByText("Sell");
      expect(buyElements.length).toBeGreaterThanOrEqual(1);
      expect(sellElements.length).toBeGreaterThanOrEqual(1);
    });

    it("should display prices with correct precision", () => {
      render(<TradeHistory trades={mockTrades} pricePrecision={2} />);
      expect(screen.getByText("$43000.00")).toBeInTheDocument();
      expect(screen.getByText("$43100.00")).toBeInTheDocument();
    });

    it("should display quantities with correct precision", () => {
      render(<TradeHistory trades={mockTrades} quantityPrecision={4} />);
      expect(screen.getByText("0.5000")).toBeInTheDocument();
      expect(screen.getByText("0.2500")).toBeInTheDocument();
    });

    it("should display fees", () => {
      render(<TradeHistory trades={mockTrades} />);
      expect(screen.getByText(/0\.2150.*USDT/)).toBeInTheDocument();
    });

    it("should show dash for missing fees", () => {
      render(<TradeHistory trades={mockTrades} />);
      // Trade 4 has no fee
      expect(screen.getByText("-")).toBeInTheDocument();
    });
  });

  describe("Symbol Column", () => {
    it("should hide symbol column by default", () => {
      render(<TradeHistory trades={mockTrades} />);
      expect(screen.queryByText("Symbol")).not.toBeInTheDocument();
    });

    it("should show symbol column when showSymbol is true", () => {
      render(<TradeHistory trades={mockTrades} showSymbol={true} />);
      expect(screen.getByText("Symbol")).toBeInTheDocument();
      // Multiple trades have BTC/USDT symbol
      const btcElements = screen.getAllByText("BTC/USDT");
      expect(btcElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("ETH/USDT")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no trades", () => {
      render(<TradeHistory trades={[]} />);
      expect(screen.getByText("No trades found")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      render(<TradeHistory trades={[]} isLoading={true} />);
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should hide trades when loading", () => {
      render(<TradeHistory trades={mockTrades} isLoading={true} />);
      expect(screen.queryByText("Buy")).not.toBeInTheDocument();
    });
  });

  describe("Filters", () => {
    it("should show filter button", () => {
      render(<TradeHistory trades={mockTrades} />);
      const filterButtons = screen.getAllByRole("button");
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it("should toggle filter panel on button click", async () => {
      const user = userEvent.setup();
      render(<TradeHistory trades={mockTrades} />);

      // Find filter button (first ghost button with icon)
      const buttons = screen.getAllByRole("button");
      const filterButton = buttons[0]; // First button is filter

      await user.click(filterButton);

      // Filter panel should be visible
      expect(screen.getByPlaceholderText("Search trades...")).toBeInTheDocument();
      expect(screen.getByText("All Sides")).toBeInTheDocument();
    });

    it("should call onFilterChange when side filter changes", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<TradeHistory trades={mockTrades} onFilterChange={onFilterChange} />);

      // Open filters
      const buttons = screen.getAllByRole("button");
      await user.click(buttons[0]);

      // Change side filter
      const sideSelect = screen.getByDisplayValue("All Sides");
      await user.selectOptions(sideSelect, "buy");

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ side: "buy" })
      );
    });

    it("should call onFilterChange when search changes", async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(<TradeHistory trades={mockTrades} onFilterChange={onFilterChange} />);

      // Open filters
      const buttons = screen.getAllByRole("button");
      await user.click(buttons[0]);

      // Type in search
      const searchInput = screen.getByPlaceholderText("Search trades...");
      await user.type(searchInput, "BTC");

      expect(onFilterChange).toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    it("should not show pagination for single page", () => {
      render(<TradeHistory trades={mockTrades} totalPages={1} />);
      expect(screen.queryByText(/Page 1 of 1/)).not.toBeInTheDocument();
    });

    it("should show pagination for multiple pages", () => {
      render(<TradeHistory trades={mockTrades} page={1} totalPages={5} />);
      expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
    });

    it("should disable previous button on first page", () => {
      render(<TradeHistory trades={mockTrades} page={1} totalPages={5} />);
      const prevButton = screen.getAllByRole("button").find(
        (btn) => btn.querySelector("svg")?.classList.contains("lucide-chevron-left")
      );
      expect(prevButton).toBeDisabled();
    });

    it("should disable next button on last page", () => {
      render(<TradeHistory trades={mockTrades} page={5} totalPages={5} />);
      const nextButton = screen.getAllByRole("button").find(
        (btn) => btn.querySelector("svg")?.classList.contains("lucide-chevron-right")
      );
      expect(nextButton).toBeDisabled();
    });

    it("should call onPageChange when pagination buttons clicked", async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(
        <TradeHistory
          trades={mockTrades}
          page={2}
          totalPages={5}
          onPageChange={onPageChange}
        />
      );

      // Click next button
      const buttons = screen.getAllByRole("button");
      const nextButton = buttons[buttons.length - 1]; // Last button is next
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(3);
    });
  });

  describe("Export", () => {
    it("should show export button when onExport provided", () => {
      const onExport = vi.fn();
      render(<TradeHistory trades={mockTrades} onExport={onExport} />);

      // Should have a download icon button
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(1);
    });

    it("should call onExport when export button clicked", async () => {
      const user = userEvent.setup();
      const onExport = vi.fn();
      render(<TradeHistory trades={mockTrades} onExport={onExport} />);

      // Click export button (second button)
      const buttons = screen.getAllByRole("button");
      await user.click(buttons[1]);

      expect(onExport).toHaveBeenCalled();
    });
  });
});

describe("RecentTrades", () => {
  describe("Rendering", () => {
    it("should render the component title", () => {
      render(<RecentTrades trades={mockTrades} />);
      expect(screen.getByText("Recent Trades")).toBeInTheDocument();
    });

    it("should display symbol when provided", () => {
      render(<RecentTrades trades={mockTrades} symbol="BTC/USDT" />);
      expect(screen.getByText("BTC/USDT")).toBeInTheDocument();
    });

    it("should display trade prices", () => {
      render(<RecentTrades trades={mockTrades} pricePrecision={2} />);
      expect(screen.getByText("$43000.00")).toBeInTheDocument();
    });

    it("should display trade quantities", () => {
      render(<RecentTrades trades={mockTrades} quantityPrecision={4} />);
      expect(screen.getByText("0.5000")).toBeInTheDocument();
    });

    it("should show buy trades in green", () => {
      render(<RecentTrades trades={[mockTrades[0]]} />);
      const priceElement = screen.getByText(/\$43000/);
      expect(priceElement.className).toContain("emerald");
    });

    it("should show sell trades in red", () => {
      render(<RecentTrades trades={[mockTrades[1]]} />);
      const priceElement = screen.getByText(/\$43100/);
      expect(priceElement.className).toContain("red");
    });
  });

  describe("Limiting Trades", () => {
    it("should limit trades to maxItems", () => {
      const manyTrades = Array.from({ length: 30 }, (_, i) => ({
        ...mockTrades[0],
        id: `trade-${i}`,
        price: 43000 + i,
      }));

      render(<RecentTrades trades={manyTrades} maxItems={10} />);

      // Should only show first 10 trades
      expect(screen.getByText("$43000.00")).toBeInTheDocument();
      expect(screen.getByText("$43009.00")).toBeInTheDocument();
      expect(screen.queryByText("$43010.00")).not.toBeInTheDocument();
    });

    it("should default to 20 max items", () => {
      const manyTrades = Array.from({ length: 30 }, (_, i) => ({
        ...mockTrades[0],
        id: `trade-${i}`,
        price: 43000 + i,
      }));

      render(<RecentTrades trades={manyTrades} />);

      expect(screen.getByText("$43019.00")).toBeInTheDocument();
      expect(screen.queryByText("$43020.00")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no trades", () => {
      render(<RecentTrades trades={[]} />);
      expect(screen.getByText("No recent trades")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      render(<RecentTrades trades={mockTrades} className="custom-class" />);
      const container = screen.getByText("Recent Trades").closest("div[class*='rounded']");
      expect(container?.className).toContain("custom-class");
    });
  });
});

describe("TradeStats", () => {
  describe("Rendering", () => {
    it("should display total trades count", () => {
      render(<TradeStats trades={mockTrades} />);
      expect(screen.getByText("Total Trades")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("should display buy count", () => {
      render(<TradeStats trades={mockTrades} />);
      expect(screen.getByText("Buys")).toBeInTheDocument();
      // Buy count is 2, but "2" appears multiple times - check the label/value pair
      const buysLabel = screen.getByText("Buys");
      const buysValue = buysLabel.nextElementSibling;
      expect(buysValue?.textContent).toBe("2");
    });

    it("should display sell count", () => {
      render(<TradeStats trades={mockTrades} />);
      expect(screen.getByText("Sells")).toBeInTheDocument();
      // Sell count is 2
      const sellsLabel = screen.getByText("Sells");
      const sellsValue = sellsLabel.nextElementSibling;
      expect(sellsValue?.textContent).toBe("2");
    });

    it("should display total volume", () => {
      // Total = 21500 + 10775 + 4800 + 950 = 38025
      render(<TradeStats trades={mockTrades} />);
      expect(screen.getByText("Total Volume")).toBeInTheDocument();
      expect(screen.getByText("$38,025")).toBeInTheDocument();
    });

    it("should display average price", () => {
      render(<TradeStats trades={mockTrades} />);
      expect(screen.getByText("Avg Price")).toBeInTheDocument();
    });

    it("should display total fees", () => {
      // Total fees = 0.215 + 0.108 + 0.048 = 0.371
      render(<TradeStats trades={mockTrades} />);
      expect(screen.getByText("Total Fees")).toBeInTheDocument();
      expect(screen.getByText("$0.3710")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show zeros for empty trades", () => {
      render(<TradeStats trades={[]} />);
      // Multiple "0" values exist - check that total trades is 0
      const totalLabel = screen.getByText("Total Trades");
      const totalValue = totalLabel.nextElementSibling;
      expect(totalValue?.textContent).toBe("0");

      // Check avg price is $0.00
      const avgLabel = screen.getByText("Avg Price");
      const avgValue = avgLabel.nextElementSibling;
      expect(avgValue?.textContent).toBe("$0.00");

      // Check fees is $0.0000
      const feesLabel = screen.getByText("Total Fees");
      const feesValue = feesLabel.nextElementSibling;
      expect(feesValue?.textContent).toBe("$0.0000");
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      render(<TradeStats trades={mockTrades} className="custom-class" />);
      const container = screen.getByText("Total Trades").closest("div[class*='grid']");
      expect(container?.className).toContain("custom-class");
    });

    it("should show buys in green", () => {
      render(<TradeStats trades={mockTrades} />);
      const buyCount = screen.getByText("Buys").nextElementSibling;
      expect(buyCount?.className).toContain("emerald");
    });

    it("should show sells in red", () => {
      render(<TradeStats trades={mockTrades} />);
      const sellCount = screen.getByText("Sells").nextElementSibling;
      expect(sellCount?.className).toContain("red");
    });

    it("should show fees in amber", () => {
      render(<TradeStats trades={mockTrades} />);
      const feeCount = screen.getByText("Total Fees").nextElementSibling;
      expect(feeCount?.className).toContain("amber");
    });
  });

  describe("Calculations", () => {
    it("should calculate correct average price", () => {
      // Total volume = 38025
      // Total quantity = 0.5 + 0.25 + 2 + 10 = 12.75
      // Average = 38025 / 12.75 ≈ 2982.35
      render(<TradeStats trades={mockTrades} />);
      expect(screen.getByText("$2982.35")).toBeInTheDocument();
    });
  });
});

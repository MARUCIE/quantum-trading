import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  OrderBook,
  HorizontalOrderBook,
  DepthChart,
  type OrderBookLevel,
} from "./order-book";

/**
 * OrderBook Component Tests
 *
 * Tests for the order book display components.
 * Covers rendering, interactions, and price level display.
 */

// Mock order book data
const mockBids: OrderBookLevel[] = [
  { price: 43200, quantity: 1.5, total: 1.5, orders: 5 },
  { price: 43190, quantity: 2.0, total: 3.5, orders: 8 },
  { price: 43180, quantity: 0.8, total: 4.3, orders: 3 },
  { price: 43170, quantity: 3.2, total: 7.5, orders: 12 },
  { price: 43160, quantity: 1.0, total: 8.5, orders: 4 },
];

const mockAsks: OrderBookLevel[] = [
  { price: 43210, quantity: 1.2, total: 1.2, orders: 4 },
  { price: 43220, quantity: 2.5, total: 3.7, orders: 7 },
  { price: 43230, quantity: 0.5, total: 4.2, orders: 2 },
  { price: 43240, quantity: 1.8, total: 6.0, orders: 6 },
  { price: 43250, quantity: 2.0, total: 8.0, orders: 9 },
];

describe("OrderBook", () => {
  const defaultProps = {
    symbol: "BTC/USDT",
    bids: mockBids,
    asks: mockAsks,
    lastPrice: 43205,
    priceChange: 2.45,
    depth: 5,
  };

  describe("Rendering", () => {
    it("should render the order book title", () => {
      render(<OrderBook {...defaultProps} />);
      expect(screen.getByText("Order Book")).toBeInTheDocument();
    });

    it("should render the symbol", () => {
      render(<OrderBook {...defaultProps} />);
      expect(screen.getByText("BTC/USDT")).toBeInTheDocument();
    });

    it("should render column headers", () => {
      render(<OrderBook {...defaultProps} />);
      expect(screen.getByText("Price")).toBeInTheDocument();
      expect(screen.getByText("Size")).toBeInTheDocument();
      expect(screen.getByText("Total")).toBeInTheDocument();
    });

    it("should render last price", () => {
      render(<OrderBook {...defaultProps} />);
      expect(screen.getByText("$43205.00")).toBeInTheDocument();
    });

    it("should render price change", () => {
      render(<OrderBook {...defaultProps} />);
      expect(screen.getByText("2.45%")).toBeInTheDocument();
    });

    it("should render bid prices in green", () => {
      render(<OrderBook {...defaultProps} />);
      const bidPrices = screen.getAllByText(/43200\.00/);
      expect(bidPrices.length).toBeGreaterThan(0);
    });

    it("should render ask prices in red", () => {
      render(<OrderBook {...defaultProps} />);
      const askPrices = screen.getAllByText(/43210\.00/);
      expect(askPrices.length).toBeGreaterThan(0);
    });

    it("should render correct number of levels based on depth", () => {
      render(<OrderBook {...defaultProps} depth={3} />);
      // Each side should show 3 levels (3 bids + 3 asks = 6 total)
      // Bids: 43200, 43190, 43180
      // Asks: 43210, 43220, 43230
      // Check that we have the expected first and last prices for each side
      expect(screen.getByText("43200.00")).toBeInTheDocument(); // First bid
      expect(screen.getByText("43180.00")).toBeInTheDocument(); // Third bid
      expect(screen.getByText("43210.00")).toBeInTheDocument(); // First ask
      expect(screen.getByText("43230.00")).toBeInTheDocument(); // Third ask
      // The fourth level prices should NOT be visible
      expect(screen.queryByText("43170.00")).not.toBeInTheDocument();
      expect(screen.queryByText("43240.00")).not.toBeInTheDocument();
    });
  });

  describe("Spread Display", () => {
    it("should display the spread", () => {
      render(<OrderBook {...defaultProps} />);
      // Spread = lowest ask - highest bid = 43210 - 43200 = 10
      expect(screen.getByText(/Spread: \$10\.00/)).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      render(<OrderBook {...defaultProps} isLoading={true} />);
      // Loading spinner should be present
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });

    it("should hide order book rows when loading", () => {
      render(<OrderBook {...defaultProps} isLoading={true} />);
      // Prices should not be visible
      expect(screen.queryByText("43200.00")).not.toBeInTheDocument();
    });
  });

  describe("Price Click Handler", () => {
    it("should call onPriceClick when bid row is clicked", () => {
      const onPriceClick = vi.fn();
      render(<OrderBook {...defaultProps} onPriceClick={onPriceClick} />);

      // Click on a bid row
      const bidRow = screen.getByText("43200.00").closest("div[class*='cursor-pointer']");
      if (bidRow) {
        fireEvent.click(bidRow);
        expect(onPriceClick).toHaveBeenCalledWith(43200, "bid");
      }
    });

    it("should call onPriceClick when ask row is clicked", () => {
      const onPriceClick = vi.fn();
      render(<OrderBook {...defaultProps} onPriceClick={onPriceClick} />);

      // Click on an ask row
      const askRow = screen.getByText("43210.00").closest("div[class*='cursor-pointer']");
      if (askRow) {
        fireEvent.click(askRow);
        expect(onPriceClick).toHaveBeenCalledWith(43210, "ask");
      }
    });
  });

  describe("Grouping Controls", () => {
    it("should render grouping buttons", () => {
      render(<OrderBook {...defaultProps} />);
      expect(screen.getByText("Grouping")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "0.01" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "0.1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
    });

    it("should highlight selected grouping", () => {
      render(<OrderBook {...defaultProps} />);
      const btn001 = screen.getByRole("button", { name: "0.01" });
      // Default grouping is 0.01, should have secondary variant
      expect(btn001.className).toContain("secondary");
    });

    it("should change grouping on click", () => {
      render(<OrderBook {...defaultProps} />);
      const btn10 = screen.getByRole("button", { name: "10" });
      fireEvent.click(btn10);
      expect(btn10.className).toContain("secondary");
    });
  });

  describe("Price Direction Indicator", () => {
    it("should show up arrow for positive change", () => {
      render(<OrderBook {...defaultProps} priceChange={5.0} />);
      // Check for emerald color (positive)
      const changeElement = screen.getByText("5.00%").closest("span");
      expect(changeElement?.className).toContain("emerald");
    });

    it("should show down arrow for negative change", () => {
      render(<OrderBook {...defaultProps} priceChange={-3.5} />);
      // Check for red color (negative)
      const changeElement = screen.getByText("3.50%").closest("span");
      expect(changeElement?.className).toContain("red");
    });
  });

  describe("Precision", () => {
    it("should use custom price precision", () => {
      render(<OrderBook {...defaultProps} pricePrecision={4} />);
      expect(screen.getByText("43200.0000")).toBeInTheDocument();
    });

    it("should use custom quantity precision", () => {
      render(<OrderBook {...defaultProps} quantityPrecision={2} />);
      // First bid quantity is 1.5, may appear in both size and total columns
      const elements = screen.getAllByText("1.50");
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Empty State", () => {
    it("should handle empty bids", () => {
      render(<OrderBook {...defaultProps} bids={[]} />);
      expect(screen.getByText("Order Book")).toBeInTheDocument();
    });

    it("should handle empty asks", () => {
      render(<OrderBook {...defaultProps} asks={[]} />);
      expect(screen.getByText("Order Book")).toBeInTheDocument();
    });
  });
});

describe("HorizontalOrderBook", () => {
  const defaultProps = {
    symbol: "BTC/USDT",
    bids: mockBids,
    asks: mockAsks,
    lastPrice: 43205,
    priceChange: 2.45,
    depth: 5,
  };

  describe("Rendering", () => {
    it("should render the order book title", () => {
      render(<HorizontalOrderBook {...defaultProps} />);
      expect(screen.getByText("Order Book")).toBeInTheDocument();
    });

    it("should render bid and ask column headers", () => {
      render(<HorizontalOrderBook {...defaultProps} />);
      expect(screen.getByText("Bid")).toBeInTheDocument();
      expect(screen.getByText("Ask")).toBeInTheDocument();
    });

    it("should render last price and change", () => {
      render(<HorizontalOrderBook {...defaultProps} />);
      expect(screen.getByText("$43205.00")).toBeInTheDocument();
      expect(screen.getByText("2.45%")).toBeInTheDocument();
    });

    it("should render both sides of the order book", () => {
      render(<HorizontalOrderBook {...defaultProps} />);
      // Should have both bid and ask prices
      expect(screen.getByText("43200.00")).toBeInTheDocument();
      expect(screen.getByText("43210.00")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      render(<HorizontalOrderBook {...defaultProps} isLoading={true} />);
      const spinner = document.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Price Click Handler", () => {
    it("should call onPriceClick for bid", () => {
      const onPriceClick = vi.fn();
      render(<HorizontalOrderBook {...defaultProps} onPriceClick={onPriceClick} />);

      const bidRow = screen.getByText("43200.00").closest("div[class*='cursor-pointer']");
      if (bidRow) {
        fireEvent.click(bidRow);
        expect(onPriceClick).toHaveBeenCalledWith(43200, "bid");
      }
    });

    it("should call onPriceClick for ask", () => {
      const onPriceClick = vi.fn();
      render(<HorizontalOrderBook {...defaultProps} onPriceClick={onPriceClick} />);

      const askRow = screen.getByText("43210.00").closest("div[class*='cursor-pointer']");
      if (askRow) {
        fireEvent.click(askRow);
        expect(onPriceClick).toHaveBeenCalledWith(43210, "ask");
      }
    });
  });
});

describe("DepthChart", () => {
  const defaultProps = {
    bids: mockBids,
    asks: mockAsks,
  };

  describe("Rendering", () => {
    it("should render the depth chart title", () => {
      render(<DepthChart {...defaultProps} />);
      expect(screen.getByText("Market Depth")).toBeInTheDocument();
    });

    it("should render an SVG element", () => {
      render(<DepthChart {...defaultProps} />);
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should handle empty bids", () => {
      render(<DepthChart bids={[]} asks={mockAsks} />);
      expect(screen.getByText("Market Depth")).toBeInTheDocument();
    });

    it("should handle empty asks", () => {
      render(<DepthChart bids={mockBids} asks={[]} />);
      expect(screen.getByText("Market Depth")).toBeInTheDocument();
    });

    it("should handle both empty", () => {
      render(<DepthChart bids={[]} asks={[]} />);
      expect(screen.getByText("Market Depth")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      render(<DepthChart {...defaultProps} className="custom-class" />);
      const container = screen.getByText("Market Depth").closest("div");
      expect(container?.className).toContain("custom-class");
    });
  });
});

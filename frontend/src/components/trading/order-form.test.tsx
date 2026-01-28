import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { OrderForm, QuickOrderForm } from "./order-form";

/**
 * OrderForm Component Tests
 *
 * Tests for the trading order form components.
 * Covers form validation, submission, and user interactions.
 */

describe("OrderForm", () => {
  const defaultProps = {
    symbol: "BTC/USDT",
    marketPrice: 43250.0,
    availableBalance: 50000.0,
  };

  describe("Rendering", () => {
    it("should render symbol in header", () => {
      render(<OrderForm {...defaultProps} />);
      expect(screen.getByText("BTC/USDT")).toBeInTheDocument();
    });

    it("should display market price", () => {
      render(<OrderForm {...defaultProps} />);
      expect(screen.getByText(/Market: \$43,250/)).toBeInTheDocument();
    });

    it("should render buy and sell buttons", () => {
      render(<OrderForm {...defaultProps} />);
      // Multiple buttons with buy/sell text (toggle + submit)
      const buyButtons = screen.getAllByRole("button", { name: /buy/i });
      const sellButtons = screen.getAllByRole("button", { name: /sell/i });
      expect(buyButtons.length).toBeGreaterThanOrEqual(1);
      expect(sellButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("should render order type select", () => {
      render(<OrderForm {...defaultProps} />);
      expect(screen.getByLabelText(/order type/i)).toBeInTheDocument();
    });

    it("should render quantity input", () => {
      render(<OrderForm {...defaultProps} />);
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    });

    it("should render time in force select", () => {
      render(<OrderForm {...defaultProps} />);
      expect(screen.getByLabelText(/time in force/i)).toBeInTheDocument();
    });

    it("should display available balance", () => {
      render(<OrderForm {...defaultProps} />);
      expect(screen.getByText(/Available: \$50,000/)).toBeInTheDocument();
    });

    it("should render percentage buttons", () => {
      render(<OrderForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: "25%" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "50%" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "75%" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "100%" })).toBeInTheDocument();
    });
  });

  describe("Side Toggle", () => {
    it("should default to buy side", () => {
      render(<OrderForm {...defaultProps} />);
      // Get all buy buttons - the first one is the toggle button
      const buyButtons = screen.getAllByRole("button", { name: /buy/i });
      const toggleBuyButton = buyButtons[0];
      // Buy button should have the green background class
      expect(toggleBuyButton.className).toContain("bg-emerald");
    });

    it("should switch to sell side on click", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      // Get all sell buttons - the first one is the toggle button
      const sellButtons = screen.getAllByRole("button", { name: /sell/i });
      const toggleSellButton = sellButtons[0];
      await user.click(toggleSellButton);

      expect(toggleSellButton.className).toContain("bg-red");
    });
  });

  describe("Order Type", () => {
    it("should show price input for limit orders", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "limit");

      expect(screen.getByLabelText(/^price$/i)).toBeInTheDocument();
    });

    it("should hide price input for market orders", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "market");

      expect(screen.queryByLabelText(/^price$/i)).not.toBeInTheDocument();
    });

    it("should show stop price for stop orders", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "stop");

      expect(screen.getByLabelText(/stop price/i)).toBeInTheDocument();
    });

    it("should show both prices for stop limit orders", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "stop_limit");

      expect(screen.getByLabelText(/stop price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^price$/i)).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("should show error for zero quantity", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<OrderForm {...defaultProps} onSubmit={onSubmit} />);

      // Select market order and submit without quantity
      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "market");

      const submitButton = screen.getByRole("button", { name: /buy btc/i });
      await user.click(submitButton);

      expect(screen.getByText(/quantity must be greater than 0/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should show error for zero price on limit order", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<OrderForm {...defaultProps} onSubmit={onSubmit} />);

      // Enter quantity but not price
      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, "1");

      // Limit is default, so submit
      const submitButton = screen.getByRole("button", { name: /buy btc/i });
      await user.click(submitButton);

      expect(screen.getByText(/price must be greater than 0/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should show error for insufficient balance", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<OrderForm {...defaultProps} availableBalance={1000} onSubmit={onSubmit} />);

      // Select market order
      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "market");

      // Enter large quantity
      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, "1"); // 1 BTC at $43,250 > $1,000

      const submitButton = screen.getByRole("button", { name: /buy btc/i });
      await user.click(submitButton);

      expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Submission", () => {
    it("should call onSubmit with correct market order data", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<OrderForm {...defaultProps} onSubmit={onSubmit} />);

      // Select market order
      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "market");

      // Enter quantity
      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, "0.5");

      // Submit
      const submitButton = screen.getByRole("button", { name: /buy btc/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          symbol: "BTC/USDT",
          side: "buy",
          type: "market",
          quantity: 0.5,
          timeInForce: "GTC",
        });
      });
    });

    it("should call onSubmit with correct limit order data", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<OrderForm {...defaultProps} onSubmit={onSubmit} />);

      // Limit is default, enter quantity and price
      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, "1");

      const priceInput = screen.getByLabelText(/^price$/i);
      await user.type(priceInput, "42000");

      // Switch to sell
      const sellButton = screen.getByRole("button", { name: /sell/i });
      await user.click(sellButton);

      // Submit
      const submitButton = screen.getByRole("button", { name: /sell btc/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          symbol: "BTC/USDT",
          side: "sell",
          type: "limit",
          quantity: 1,
          price: 42000,
          timeInForce: "GTC",
        });
      });
    });
  });

  describe("Loading State", () => {
    it("should disable form when loading", () => {
      render(<OrderForm {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText(/quantity/i)).toBeDisabled();
      expect(screen.getByLabelText(/order type/i)).toBeDisabled();
    });

    it("should show loading spinner on submit button", () => {
      render(<OrderForm {...defaultProps} isLoading={true} />);

      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("should disable all inputs when disabled", () => {
      render(<OrderForm {...defaultProps} disabled={true} />);

      expect(screen.getByLabelText(/quantity/i)).toBeDisabled();
      expect(screen.getByLabelText(/order type/i)).toBeDisabled();
      // Get toggle buttons (first in the list)
      const buyButtons = screen.getAllByRole("button", { name: /buy/i });
      const sellButtons = screen.getAllByRole("button", { name: /sell/i });
      expect(buyButtons[0]).toBeDisabled();
      expect(sellButtons[0]).toBeDisabled();
    });
  });

  describe("Error Display", () => {
    it("should display external error", () => {
      render(<OrderForm {...defaultProps} error="Order rejected by server" />);

      expect(screen.getByText("Order rejected by server")).toBeInTheDocument();
    });
  });

  describe("Percentage Buttons", () => {
    it("should set quantity to 25% of available balance", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const btn25 = screen.getByRole("button", { name: "25%" });
      await user.click(btn25);

      const quantityInput = screen.getByLabelText(/quantity/i) as HTMLInputElement;
      const expectedQty = (50000 / 43250) * 0.25;
      expect(parseFloat(quantityInput.value)).toBeCloseTo(expectedQty, 4);
    });

    it("should set quantity to 100% of available balance", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const btn100 = screen.getByRole("button", { name: "100%" });
      await user.click(btn100);

      const quantityInput = screen.getByLabelText(/quantity/i) as HTMLInputElement;
      const expectedQty = 50000 / 43250;
      expect(parseFloat(quantityInput.value)).toBeCloseTo(expectedQty, 4);
    });
  });

  describe("Total Calculation", () => {
    it("should calculate total for limit order", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, "2");

      const priceInput = screen.getByLabelText(/^price$/i);
      await user.type(priceInput, "40000");

      // Total should be 2 * 40000 = 80,000
      expect(screen.getByText("$80,000")).toBeInTheDocument();
    });

    it("should calculate total for market order using market price", async () => {
      const user = userEvent.setup();
      render(<OrderForm {...defaultProps} />);

      const orderTypeSelect = screen.getByLabelText(/order type/i);
      await user.selectOptions(orderTypeSelect, "market");

      const quantityInput = screen.getByLabelText(/quantity/i);
      await user.type(quantityInput, "1");

      // Total should be 1 * 43250 = 43,250
      expect(screen.getByText("$43,250")).toBeInTheDocument();
    });
  });
});

describe("QuickOrderForm", () => {
  const defaultProps = {
    symbol: "BTC/USDT",
    marketPrice: 43250.0,
  };

  describe("Rendering", () => {
    it("should render symbol", () => {
      render(<QuickOrderForm {...defaultProps} />);
      expect(screen.getByText("BTC/USDT")).toBeInTheDocument();
    });

    it("should render market price", () => {
      render(<QuickOrderForm {...defaultProps} />);
      expect(screen.getByText(/\$43,250/)).toBeInTheDocument();
    });

    it("should render quantity input", () => {
      render(<QuickOrderForm {...defaultProps} />);
      expect(screen.getByPlaceholderText(/quantity/i)).toBeInTheDocument();
    });

    it("should render buy and sell buttons", () => {
      render(<QuickOrderForm {...defaultProps} />);
      expect(screen.getByRole("button", { name: /buy/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sell/i })).toBeInTheDocument();
    });
  });

  describe("Submission", () => {
    it("should call onSubmit with buy order", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<QuickOrderForm {...defaultProps} onSubmit={onSubmit} />);

      const quantityInput = screen.getByPlaceholderText(/quantity/i);
      await user.type(quantityInput, "0.5");

      const buyButton = screen.getByRole("button", { name: /buy/i });
      await user.click(buyButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          side: "buy",
          quantity: 0.5,
        });
      });
    });

    it("should call onSubmit with sell order", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<QuickOrderForm {...defaultProps} onSubmit={onSubmit} />);

      const quantityInput = screen.getByPlaceholderText(/quantity/i);
      await user.type(quantityInput, "1");

      const sellButton = screen.getByRole("button", { name: /sell/i });
      await user.click(sellButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          side: "sell",
          quantity: 1,
        });
      });
    });

    it("should not submit without quantity", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<QuickOrderForm {...defaultProps} onSubmit={onSubmit} />);

      const buyButton = screen.getByRole("button", { name: /buy/i });
      await user.click(buyButton);

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("Button States", () => {
    it("should disable buttons when loading", () => {
      render(<QuickOrderForm {...defaultProps} isLoading={true} />);

      // When loading, buttons show spinner instead of text
      // Find all buttons in the form (there should be 2)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toBeDisabled();
      expect(buttons[1]).toBeDisabled();
    });

    it("should disable buttons without quantity", () => {
      render(<QuickOrderForm {...defaultProps} />);

      expect(screen.getByRole("button", { name: /buy/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /sell/i })).toBeDisabled();
    });

    it("should enable buttons with quantity", async () => {
      const user = userEvent.setup();
      render(<QuickOrderForm {...defaultProps} />);

      const quantityInput = screen.getByPlaceholderText(/quantity/i);
      await user.type(quantityInput, "1");

      expect(screen.getByRole("button", { name: /buy/i })).not.toBeDisabled();
      expect(screen.getByRole("button", { name: /sell/i })).not.toBeDisabled();
    });
  });
});

"use client";

/**
 * Order Form Component
 *
 * Core trading component for submitting market/limit orders.
 * Supports buy/sell sides with real-time validation.
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectOption } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type TimeInForce = "GTC" | "IOC" | "FOK" | "DAY";

export interface OrderFormData {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: TimeInForce;
}

export interface OrderFormProps {
  /** Trading symbol (e.g., "BTC/USDT") */
  symbol: string;
  /** Current market price for reference */
  marketPrice?: number;
  /** Available balance for the quote currency */
  availableBalance?: number;
  /** Callback when order is submitted */
  onSubmit?: (order: OrderFormData) => Promise<void>;
  /** Whether the form is in loading state */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Additional class names */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export function OrderForm({
  symbol,
  marketPrice,
  availableBalance,
  onSubmit,
  isLoading = false,
  error,
  className,
  disabled = false,
}: OrderFormProps) {
  const t = useTranslations("trading");
  const tForm = useTranslations("orderForm");
  const [side, setSide] = React.useState<OrderSide>("buy");
  const [orderType, setOrderType] = React.useState<OrderType>("limit");
  const [quantity, setQuantity] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [stopPrice, setStopPrice] = React.useState("");
  const [timeInForce, setTimeInForce] = React.useState<TimeInForce>("GTC");
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );

  // Calculate total value
  const totalValue = React.useMemo(() => {
    const qty = parseFloat(quantity) || 0;
    const prc =
      orderType === "market" ? marketPrice || 0 : parseFloat(price) || 0;
    return qty * prc;
  }, [quantity, price, orderType, marketPrice]);

  // Validate form
  const validateForm = (): boolean => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      setValidationError(tForm("quantityGreaterThanZero"));
      return false;
    }

    if (orderType === "limit" || orderType === "stop_limit") {
      const prc = parseFloat(price);
      if (!prc || prc <= 0) {
        setValidationError(tForm("priceGreaterThanZero"));
        return false;
      }
    }

    if (orderType === "stop" || orderType === "stop_limit") {
      const stop = parseFloat(stopPrice);
      if (!stop || stop <= 0) {
        setValidationError(tForm("stopPriceGreaterThanZero"));
        return false;
      }
    }

    if (availableBalance !== undefined && totalValue > availableBalance) {
      setValidationError(t("insufficientBalance"));
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const orderData: OrderFormData = {
      symbol,
      side,
      type: orderType,
      quantity: parseFloat(quantity),
      timeInForce,
    };

    if (orderType === "limit" || orderType === "stop_limit") {
      orderData.price = parseFloat(price);
    }

    if (orderType === "stop" || orderType === "stop_limit") {
      orderData.stopPrice = parseFloat(stopPrice);
    }

    await onSubmit?.(orderData);
  };

  const handlePercentage = (percent: number) => {
    if (!marketPrice || !availableBalance) return;

    const maxQty = availableBalance / marketPrice;
    const newQty = (maxQty * percent) / 100;
    setQuantity(newQty.toFixed(6));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-4 rounded-lg border bg-card p-4", className)}
    >
      {/* Symbol Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <span className="text-lg font-semibold">{symbol}</span>
        {marketPrice && (
          <span className="text-sm text-muted-foreground">
            Market: ${marketPrice.toLocaleString()}
          </span>
        )}
      </div>

      {/* Buy/Sell Toggle */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={side === "buy" ? "default" : "outline"}
          className={cn(
            side === "buy" &&
              "bg-emerald-600 hover:bg-emerald-700 text-white"
          )}
          onClick={() => setSide("buy")}
          disabled={disabled || isLoading}
        >
          <ArrowUpCircle className="mr-2 h-4 w-4" />
          {t("buy")}
        </Button>
        <Button
          type="button"
          variant={side === "sell" ? "default" : "outline"}
          className={cn(
            side === "sell" && "bg-red-600 hover:bg-red-700 text-white"
          )}
          onClick={() => setSide("sell")}
          disabled={disabled || isLoading}
        >
          <ArrowDownCircle className="mr-2 h-4 w-4" />
          {t("sell")}
        </Button>
      </div>

      {/* Order Type */}
      <div className="space-y-2">
        <Label htmlFor="orderType">{tForm("orderType")}</Label>
        <Select
          id="orderType"
          value={orderType}
          onChange={(e) => setOrderType(e.target.value as OrderType)}
          disabled={disabled || isLoading}
        >
          <SelectOption value="market">{tForm("marketOrder")}</SelectOption>
          <SelectOption value="limit">{tForm("limitOrder")}</SelectOption>
          <SelectOption value="stop">{tForm("stopOrder")}</SelectOption>
          <SelectOption value="stop_limit">{tForm("stopLimitOrder")}</SelectOption>
        </Select>
      </div>

      {/* Stop Price (for stop orders) */}
      {(orderType === "stop" || orderType === "stop_limit") && (
        <div className="space-y-2">
          <Label htmlFor="stopPrice">{t("stopPrice")}</Label>
          <Input
            id="stopPrice"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={stopPrice}
            onChange={(e) => setStopPrice(e.target.value)}
            disabled={disabled || isLoading}
          />
        </div>
      )}

      {/* Price (for limit orders) */}
      {(orderType === "limit" || orderType === "stop_limit") && (
        <div className="space-y-2">
          <Label htmlFor="price">{t("price")}</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={disabled || isLoading}
          />
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="quantity">{t("quantity")}</Label>
          {availableBalance !== undefined && (
            <span className="text-xs text-muted-foreground">
              {t("available")}: ${availableBalance.toLocaleString()}
            </span>
          )}
        </div>
        <Input
          id="quantity"
          type="number"
          step="0.000001"
          placeholder="0.00"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          disabled={disabled || isLoading}
        />

        {/* Quick percentage buttons */}
        {availableBalance !== undefined && marketPrice && (
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((pct) => (
              <Button
                key={pct}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => handlePercentage(pct)}
                disabled={disabled || isLoading}
              >
                {pct}%
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Time in Force */}
      <div className="space-y-2">
        <Label htmlFor="timeInForce">{t("timeInForce")}</Label>
        <Select
          id="timeInForce"
          value={timeInForce}
          onChange={(e) => setTimeInForce(e.target.value as TimeInForce)}
          disabled={disabled || isLoading}
        >
          <SelectOption value="GTC">{tForm("gtcFull")}</SelectOption>
          <SelectOption value="IOC">{tForm("iocFull")}</SelectOption>
          <SelectOption value="FOK">{tForm("fokFull")}</SelectOption>
          <SelectOption value="DAY">{tForm("dayOrder")}</SelectOption>
        </Select>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between border-t pt-3 text-sm">
        <span className="text-muted-foreground">{t("total")}</span>
        <span className="font-semibold">${totalValue.toLocaleString()}</span>
      </div>

      {/* Error Display */}
      {(error || validationError) && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error || validationError}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className={cn(
          "w-full",
          side === "buy"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-red-600 hover:bg-red-700"
        )}
        disabled={disabled || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("submitting")}
          </>
        ) : (
          <>
            {side === "buy" ? t("buy") : t("sell")} {symbol.split("/")[0]}
          </>
        )}
      </Button>
    </form>
  );
}

/**
 * Quick Order Form - Simplified version for rapid trading
 */
export interface QuickOrderFormProps {
  symbol: string;
  marketPrice?: number;
  onSubmit?: (order: Pick<OrderFormData, "side" | "quantity">) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function QuickOrderForm({
  symbol,
  marketPrice,
  onSubmit,
  isLoading = false,
  className,
}: QuickOrderFormProps) {
  const t = useTranslations("trading");
  const [quantity, setQuantity] = React.useState("");

  const handleQuickOrder = async (side: OrderSide) => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return;

    await onSubmit?.({ side, quantity: qty });
  };

  return (
    <div className={cn("space-y-3 rounded-lg border bg-card p-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{symbol}</span>
        {marketPrice && (
          <span className="text-sm font-semibold">
            ${marketPrice.toLocaleString()}
          </span>
        )}
      </div>

      <Input
        type="number"
        step="0.000001"
        placeholder={t("quantity")}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        disabled={isLoading}
      />

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => handleQuickOrder("buy")}
          disabled={isLoading || !quantity}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("buy")}
        </Button>
        <Button
          variant="default"
          className="bg-red-600 hover:bg-red-700"
          onClick={() => handleQuickOrder("sell")}
          disabled={isLoading || !quantity}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("sell")}
        </Button>
      </div>
    </div>
  );
}

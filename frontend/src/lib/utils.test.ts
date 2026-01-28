import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (className utility)", () => {
  describe("basic usage", () => {
    it("should return empty string for no arguments", () => {
      expect(cn()).toBe("");
    });

    it("should return single class name", () => {
      expect(cn("foo")).toBe("foo");
    });

    it("should join multiple class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should filter out falsy values", () => {
      expect(cn("foo", null, undefined, false, "", "bar")).toBe("foo bar");
    });
  });

  describe("conditional classes", () => {
    it("should support object syntax", () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
    });

    it("should support mixed array and object syntax", () => {
      expect(cn("base", { active: true, disabled: false }, "extra")).toBe(
        "base active extra"
      );
    });

    it("should support nested arrays", () => {
      expect(cn(["foo", ["bar", ["baz"]]])).toBe("foo bar baz");
    });
  });

  describe("tailwind merge", () => {
    it("should merge conflicting tailwind classes", () => {
      expect(cn("p-4", "p-2")).toBe("p-2");
    });

    it("should merge responsive variants correctly", () => {
      expect(cn("p-4", "md:p-6", "p-2")).toBe("md:p-6 p-2");
    });

    it("should merge color classes", () => {
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should keep non-conflicting classes", () => {
      expect(cn("p-4", "m-2")).toBe("p-4 m-2");
    });

    it("should merge background and text colors separately", () => {
      expect(cn("bg-red-500", "text-blue-500", "bg-green-500")).toBe(
        "text-blue-500 bg-green-500"
      );
    });

    it("should handle hover variants", () => {
      expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe("hover:bg-blue-500");
    });

    it("should handle focus-visible variants", () => {
      expect(cn("focus-visible:ring-2", "focus-visible:ring-4")).toBe(
        "focus-visible:ring-4"
      );
    });
  });

  describe("real-world component scenarios", () => {
    it("should handle button variant classes", () => {
      const baseClasses = "px-4 py-2 rounded-md font-medium";
      const variantClasses = "bg-primary text-primary-foreground";
      const customClasses = "bg-blue-500";

      // Custom should override variant
      expect(cn(baseClasses, variantClasses, customClasses)).toContain("bg-blue-500");
      expect(cn(baseClasses, variantClasses, customClasses)).not.toContain("bg-primary");
    });

    it("should handle input error state", () => {
      // border-input and border-destructive are color classes, not width
      // border is width class, so it stays
      const base = "border border-input";
      const error = true;
      const result = cn(base, error && "border-destructive");

      // tailwind-merge keeps border (width) and replaces border-input with border-destructive (color)
      expect(result).toBe("border border-destructive");
    });

    it("should handle disabled state", () => {
      const base = "opacity-100 cursor-pointer";
      const disabled = true;
      const result = cn(base, disabled && "opacity-50 cursor-not-allowed");

      expect(result).toBe("opacity-50 cursor-not-allowed");
    });
  });
});

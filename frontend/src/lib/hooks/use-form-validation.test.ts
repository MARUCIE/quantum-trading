import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormValidation, type ValidationRule } from "./use-form-validation";

describe("useFormValidation", () => {
  describe("initialization", () => {
    it("should initialize with correct default values", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { initialValue: "John" },
          email: { initialValue: "john@example.com" },
        })
      );

      expect(result.current.getValue("name")).toBe("John");
      expect(result.current.getValue("email")).toBe("john@example.com");
      expect(result.current.isValid).toBe(true);
      expect(result.current.isDirty).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
    });

    it("should initialize with no errors", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
        })
      );

      // No errors until field is touched
      expect(result.current.getError("name")).toBeUndefined();
    });
  });

  describe("setValue", () => {
    it("should update field value", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { initialValue: "John" },
        })
      );

      act(() => {
        result.current.setValue("name", "Jane");
      });

      expect(result.current.getValue("name")).toBe("Jane");
    });

    it("should mark field as dirty when value changes", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { initialValue: "John" },
        })
      );

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setValue("name", "Jane");
      });

      expect(result.current.isDirty).toBe(true);
    });

    it("should not be dirty if value matches initial", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { initialValue: "John" },
        })
      );

      act(() => {
        result.current.setValue("name", "Jane");
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.setValue("name", "John");
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe("validation rules", () => {
    it("should validate required field", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.getError("name")).toBe("This field is required");
      expect(result.current.isValid).toBe(false);
    });

    it("should validate minLength", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "ab",
            rules: [{ type: "minLength", value: 3 }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.getError("name")).toBe("Must be at least 3 characters");
    });

    it("should validate maxLength", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "abcdefghijk",
            rules: [{ type: "maxLength", value: 10 }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.getError("name")).toBe("Must be no more than 10 characters");
    });

    it("should validate email format", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: {
            initialValue: "invalid-email",
            rules: [{ type: "email" }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("email");
      });

      expect(result.current.getError("email")).toBe("Invalid email address");
    });

    it("should pass valid email", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          email: {
            initialValue: "test@example.com",
            rules: [{ type: "email" }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("email");
      });

      expect(result.current.getError("email")).toBeUndefined();
      expect(result.current.isValid).toBe(true);
    });

    it("should validate pattern", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          phone: {
            initialValue: "abc",
            rules: [
              { type: "pattern", value: /^\d+$/, message: "Only numbers allowed" },
            ] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("phone");
      });

      expect(result.current.getError("phone")).toBe("Only numbers allowed");
    });

    it("should validate min value", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          age: {
            initialValue: "17",
            rules: [{ type: "min", value: 18 }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("age");
      });

      expect(result.current.getError("age")).toBe("Must be at least 18");
    });

    it("should validate max value", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          quantity: {
            initialValue: "101",
            rules: [{ type: "max", value: 100 }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("quantity");
      });

      expect(result.current.getError("quantity")).toBe("Must be no more than 100");
    });

    it("should support custom validation", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          password: {
            initialValue: "weak",
            rules: [
              {
                type: "custom",
                validate: (value: string) =>
                  value.length < 8 ? "Password must be at least 8 characters" : undefined,
              },
            ] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("password");
      });

      expect(result.current.getError("password")).toBe(
        "Password must be at least 8 characters"
      );
    });

    it("should support custom error messages", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "",
            rules: [
              { type: "required", message: "Name is mandatory" },
            ] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.getError("name")).toBe("Name is mandatory");
    });
  });

  describe("handleBlur", () => {
    it("should mark field as touched on blur", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { initialValue: "John" },
        })
      );

      expect(result.current.isTouched("name")).toBe(false);

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.isTouched("name")).toBe(true);
    });

    it("should validate field on blur", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
        })
      );

      expect(result.current.getError("name")).toBeUndefined();

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.getError("name")).toBe("This field is required");
    });
  });

  describe("validateAll", () => {
    it("should validate all fields and return validity", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
          email: {
            initialValue: "invalid",
            rules: [{ type: "email" }] as ValidationRule<string>[],
          },
        })
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid!).toBe(false);
      expect(result.current.getError("name")).toBe("This field is required");
      expect(result.current.getError("email")).toBe("Invalid email address");
    });

    it("should return true when all fields are valid", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "John",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
          email: {
            initialValue: "john@example.com",
            rules: [{ type: "email" }] as ValidationRule<string>[],
          },
        })
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateAll();
      });

      expect(isValid!).toBe(true);
    });
  });

  describe("handleSubmit", () => {
    it("should call onSubmit with values when form is valid", async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "John",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
        })
      );

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(onSubmit)(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(onSubmit).toHaveBeenCalledWith({ name: "John" });
    });

    it("should not call onSubmit when form is invalid", async () => {
      const onSubmit = vi.fn();
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
        })
      );

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      await act(async () => {
        await result.current.handleSubmit(onSubmit)(mockEvent);
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should set isSubmitting during async submit", async () => {
      const onSubmit = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() =>
        useFormValidation({
          name: { initialValue: "John" },
        })
      );

      const mockEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent;

      expect(result.current.isSubmitting).toBe(false);

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.handleSubmit(onSubmit)(mockEvent);
      });

      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        await submitPromise!;
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("reset", () => {
    it("should reset form to initial values", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: { initialValue: "John" },
        })
      );

      act(() => {
        result.current.setValue("name", "Jane");
      });

      expect(result.current.getValue("name")).toBe("Jane");
      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.getValue("name")).toBe("John");
      expect(result.current.isDirty).toBe(false);
    });

    it("should clear errors on reset", () => {
      const { result } = renderHook(() =>
        useFormValidation({
          name: {
            initialValue: "",
            rules: [{ type: "required" }] as ValidationRule<string>[],
          },
        })
      );

      act(() => {
        result.current.handleBlur("name");
      });

      expect(result.current.getError("name")).toBeDefined();

      act(() => {
        result.current.reset();
      });

      expect(result.current.getError("name")).toBeUndefined();
    });
  });
});

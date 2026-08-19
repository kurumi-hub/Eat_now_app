"use client";

import { Box, FormHelperText, Typography } from "@mui/material";
import {
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

export const OTP_LENGTH = 8;

type OtpCodeInputProps = {
  digits: string[];
  disabled?: boolean;
  error?: string;
  onChange: (digits: string[]) => void;
};

export default function OtpCodeInput({
  digits,
  disabled = false,
  error = "",
  onChange,
}: OtpCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    inputRefs.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))]?.focus();
  };

  const applyDigits = (startIndex: number, rawValue: string) => {
    const numericValue = rawValue.replace(/\D/g, "");

    if (!numericValue) {
      const nextDigits = [...digits];
      nextDigits[startIndex] = "";
      onChange(nextDigits);
      return;
    }

    const effectiveStart = numericValue.length >= OTP_LENGTH ? 0 : startIndex;
    const nextDigits = [...digits];
    const availableDigits = numericValue.slice(0, OTP_LENGTH - effectiveStart);

    availableDigits.split("").forEach((digit, offset) => {
      nextDigits[effectiveStart + offset] = digit;
    });

    onChange(nextDigits);
    focusInput(effectiveStart + availableDigits.length);
  };

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    applyDigits(index, event.target.value);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      const nextDigits = [...digits];
      nextDigits[index - 1] = "";
      onChange(nextDigits);
      focusInput(index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    applyDigits(index, event.clipboardData.getData("text"));
  };

  return (
    <Box className="auth-otp-field">
      <Typography component="label" className="auth-field-label">
        Mã xác nhận 8 số
      </Typography>
      <Box
        className={`auth-otp-grid${error ? " auth-otp-grid--error" : ""}`}
        role="group"
        aria-label="Mã xác nhận gồm 8 chữ số"
        aria-describedby="auth-otp-helper"
      >
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            className="auth-otp-digit"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            value={digits[index] || ""}
            maxLength={OTP_LENGTH}
            disabled={disabled}
            aria-label={`Chữ số thứ ${index + 1}`}
            aria-invalid={Boolean(error)}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(index, event)}
            onFocus={(event) => event.currentTarget.select()}
          />
        ))}
      </Box>
      <FormHelperText id="auth-otp-helper" error={Boolean(error)}>
        {error || "Nhập hoặc dán mã 8 số được gửi trong email của bạn."}
      </FormHelperText>
    </Box>
  );
}

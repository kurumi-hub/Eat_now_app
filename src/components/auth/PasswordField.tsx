"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { useState } from "react";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "error"> & {
  errorMessage?: string;
};

export default function PasswordField({
  errorMessage,
  helperText,
  slotProps,
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsVisible((current) => !current);
  };

  return (
    <TextField
      {...props}
      type={isVisible ? "text" : "password"}
      error={Boolean(errorMessage)}
      helperText={errorMessage || helperText}
      slotProps={{
        ...slotProps,
        htmlInput: {
          "aria-label":
            typeof props.label === "string"
              ? props.label
              : props.name || "Mật khẩu",
          ...slotProps?.htmlInput,
        },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon color="action" fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                edge="end"
                onClick={handleToggleVisibility}
              >
                {isVisible ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
          ...slotProps?.input,
        },
      }}
    />
  );
}

"use client";

import { createTheme } from "@mui/material/styles";

const colors = {
  primary: "#D94720",
  primaryDark: "#B93618",
  secondary: "#70645D",
  accent: "#FFB84D",
  background: "#FFF8F4",
  surface: "#FFFFFF",
  textPrimary: "#251D18",
  textSecondary: "#70645D",
  border: "#EADFD8",
  success: "#27865C",
  warning: "#E59A21",
  error: "#D63A3A",
  info: "#005F9D",
};

const focusRing = `0 0 0 3px ${colors.accent}55`;

const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: colors.secondary,
      contrastText: "#FFFFFF",
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
    info: {
      main: colors.info,
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily:
      "var(--font-be-vietnam), 'Be Vietnam Pro', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontSize: "32px",
      lineHeight: "40px",
      fontWeight: 700,
      letterSpacing: 0,
    },
    h2: {
      fontSize: "24px",
      lineHeight: "32px",
      fontWeight: 700,
      letterSpacing: 0,
    },
    h3: {
      fontSize: "20px",
      lineHeight: "28px",
      fontWeight: 600,
      letterSpacing: 0,
    },
    body1: {
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: 0,
    },
    body2: {
      fontSize: "14px",
      lineHeight: "22px",
      letterSpacing: 0,
    },
    button: {
      fontSize: "15px",
      lineHeight: "20px",
      fontWeight: 600,
      letterSpacing: 0,
      textTransform: "none",
    },
    caption: {
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: 0,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 12,
          paddingInline: 18,
          "&:focus-visible": {
            boxShadow: focusRing,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        size: "small",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 12,
          backgroundColor: "#FFFDFC",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#B99180",
          },
          "&.Mui-focused": {
            boxShadow: focusRing,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: colors.primary,
            borderWidth: 1,
          },
        },
        notchedOutline: {
          borderColor: "#D9C9C0",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: colors.textSecondary,
          fontSize: 13,
          lineHeight: "18px",
          fontWeight: 600,
          "&.Mui-focused": {
            color: colors.primary,
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          color: "#B99180",
          "&.Mui-checked": {
            color: colors.primary,
          },
          "&:focus-visible": {
            borderRadius: 8,
            boxShadow: focusRing,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 14px 34px rgba(37, 29, 24, 0.08)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          alignItems: "center",
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          "&:focus-visible": {
            boxShadow: focusRing,
          },
        },
      },
    },
  },
});

export default theme;

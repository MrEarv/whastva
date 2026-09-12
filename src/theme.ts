import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Azul estándar MUI
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#ffffff", // Fondo blanco
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a1a", // Texto oscuro
      secondary: "#666666", // Texto gris
    },
  },
  typography: {
    h4: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h6: {
      fontWeight: 400,
      fontSize: "1.5rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16, // Bordes globales más redondeados
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        contained: {
          borderRadius: 999, // Botones estilo pill
          textTransform: "none",
          paddingLeft: "20px",
          paddingRight: "20px",
        },
        text: {
          textTransform: "none",
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Tarjetas y fondos redondeados
        },
      },
    },
  },
});

export default theme;
  
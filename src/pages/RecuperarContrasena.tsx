import * as React from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, Email as EmailIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import config from "../config";

const fecha = new Date().toLocaleDateString();
const hora = new Date().toLocaleTimeString();

export default function RecuperarContrasena() {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [alert, setAlert] = React.useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showEmail, setShowEmail] = React.useState(true);
  const navigate = useNavigate();

  const validateEmail = (value: string) =>
    /^(?:[a-zA-Z0-9_\'^&\/+{}!#$%*?|~.-]+)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!email) {
      setAlert({ type: "error", msg: "Ingresa tu correo" });
      return;
    } else if (!validateEmail(email)) {
      setAlert({ type: "error", msg: "Correo inválido" });
      return;
    }

    setSubmitting(true);
    try {
            const response = await fetch(config.API_URL + '/user/send_resovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fecha: fecha + " " + hora,
          auth: localStorage.getItem("token"),
          accion: "POST",
          data: {
            email: email
          }
          }),
      });
      if (response.ok) {
        setAlert({ type: "success", msg: 'Se envió un link de recuperación. Por favor revisa tu correo.' });
        setEmail("");
      } else {
        const errorData = await response.json();
        setAlert({ type: "error", msg: errorData.message || "Ocurrió un error. Inténtalo de nuevo." });
      }
    } catch (err) {
      setAlert({ type: "error", msg: "Ocurrió un error. Inténtalo de nuevo." });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(99, 102, 241, 0.15), transparent), radial-gradient(800px 400px at 110% 110%, rgba(16, 185, 129, 0.15), transparent)",
        padding: 2,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          backdropFilter: "blur(6px)",
          width: { xs: 320, sm: 450 },
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            ¿Olvidaste tu contraseña?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ingresa tu correo para recibir instrucciones y restablecer tu contraseña.
          </Typography>
        </Box>

        {alert && (
          <Alert
            severity={alert.type}
            onClose={() => setAlert(null)}
            sx={{ mb: 2, borderRadius: 2, width: "100%" }}
          >
            {alert.msg}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate width="100%">
          <TextField
            label="Correo electrónico"
            placeholder="tu@correo.com"
            type={showEmail ? "text" : "password"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            autoComplete="email"
            autoFocus
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    aria-label={showEmail ? "Mostrar" : "Ocultar"}
                    onClick={() => setShowEmail((s) => !s)}
                  >
                    <EmailIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={submitting}
            sx={{
              py: 1.5,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 700,
              mt: 2,
              background: "linear-gradient(90deg, #6366f1, #10b981)",
              "&:hover": { background: "linear-gradient(90deg, #4f46e5, #059669)" },
            }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Enviar"}
          </Button>

          <Button
                variant="outlined"
                fullWidth
                onClick={() => (window.location.href = "http://localhost:5173/login")}
                sx={{
                    mt: 2,
                    py: 1.2,
                    borderRadius: 3,
                    textTransform: "none",
                    color: "#4b5563",
                    borderColor: "#d1d5db",
                    "&:hover": { borderColor: "#10b981", color: "#10b981" },
                }}
                >
                ← Volver al login
                </Button>
        </Box>
      </Paper>
    </Box>
  );
}

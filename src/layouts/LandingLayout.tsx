import React, { useEffect, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Link as MUILink,
  Typography,
  IconButton,
  useTheme,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import RedeemIcon from "@mui/icons-material/Redeem";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuIcon from "@mui/icons-material/Menu";

import QrWhatsapp from "../pages/QrWhatsapp";

type Props = {
  children: React.ReactNode;
  onToggleTheme?: () => void;
  mode?: "light" | "dark";
};

export default function LandingLayout({ children, onToggleTheme, mode = "light" }: Props) {
  const theme = useTheme();
  const isLight = mode !== "dark";
  const location = useLocation();

  const [openQR, setOpenQR] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (location.pathname.startsWith("/panel/dashboard")) {
      setOpenQR(true);
    } else {
      setOpenQR(false);
    }
  }, [location]);

  const drawerContent = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Menú
      </Typography>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="#">
            <ListItemText primary="Política de privacidad" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="#">
            <ListItemText primary="Términos y condiciones" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="#">
            <ListItemText primary="Contáctanos" />
          </ListItemButton>
        </ListItem>
      </List>
      {onToggleTheme && (
        <Box sx={{ mt: 2 }}>
           <IconButton onClick={onToggleTheme} sx={{ p: 1.5, backgroundColor: theme.palette.action.hover, borderRadius: 2 }}>
              {isLight ? <DarkModeIcon htmlColor="#000"/> : <LightModeIcon htmlColor="#fff"/>}
           </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: isLight ? "rgba(255,255,255,0.8)" : "rgba(18,18,18,0.8)",
          backdropFilter: "saturate(180%) blur(6px)",
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ minHeight: 72, px: { xs: 1, sm: 2 } }}>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Whatsvaa
            </Typography>
            
            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              <MUILink component={RouterLink} to="#" underline="none" color="text.secondary">
                Política de privacidad
              </MUILink>
              <MUILink component={RouterLink} to="#" underline="none" color="text.secondary">
                Términos y condiciones
              </MUILink>
              <MUILink component={RouterLink} to="#" underline="none" color="text.secondary">
                Contáctanos
              </MUILink>
              {onToggleTheme && (
                <IconButton
                  onClick={onToggleTheme}
                  sx={{
                    backgroundColor: isLight ? theme.palette.grey[200] : theme.palette.grey[800],
                    '&:hover': {
                      backgroundColor: isLight ? theme.palette.grey[300] : theme.palette.grey[700],
                    }
                  }}
                >
                  {isLight ? <DarkModeIcon htmlColor="#000" /> : <LightModeIcon htmlColor="#fff" />}
                </IconButton>
              )}
              <Button
                component={RouterLink}
                to="/panel/dashboard"
                variant="contained"
                startIcon={<RedeemIcon />}
              >
                PANEL DE CONTROL
              </Button>
            </Box>

            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 0.5 }}>
              <Button
                component={RouterLink}
                to="/panel/dashboard"
                variant="contained"
                size="small"
              >
                Panel
              </Button>
               <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                {/* AQUÍ ESTÁ LA CORRECCIÓN */}
                <MenuIcon sx={{ color: 'text.primary' }} />
              </IconButton>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>
      
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ py: { xs: 6, md: 10 }, flexGrow: 1, overflowY: "auto" }}>
        {children}
      </Box>

      <QrWhatsapp open={openQR} onClose={() => setOpenQR(false)} />
    </Box>
  );
}
import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AccountPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Configuración de la cuenta
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6">
          Información del perfil
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Aquí podrás ver y editar la información de tu cuenta.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AccountPage;
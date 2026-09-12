import React from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const statsData = [
  {
    title: 'USUARIOS',
    value: '1,284',
    change: '+12 hoy',
    changeColor: 'success.main',
    icon: <GroupIcon fontSize="large" sx={{ color: 'primary.main' }} />
  },
  {
    title: 'VENTAS',
    value: '$23,900',
    change: '+8% semanal',
    changeColor: 'success.main',
    icon: <TrendingUpIcon fontSize="large" sx={{ color: 'success.main' }} />
  },
  {
    title: 'TICKETS',
    value: '73',
    change: '5 abiertos',
    changeColor: 'text.secondary',
    icon: <ConfirmationNumberIcon fontSize="large" sx={{ color: 'warning.main' }} />
  },
  {
    title: 'TASA DE ERROR',
    value: '0.34%',
    change: '-0.02% vs ayer',
    changeColor: 'error.main',
    icon: <ErrorOutlineIcon fontSize="large" sx={{ color: 'error.main' }} />
  }
];

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeColor: string;
  icon: React.ReactElement;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeColor, icon }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 4,
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: theme.shadows[4]
        }
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {icon}
        <Typography variant="h4" component="p" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: changeColor }}>
        {change}
      </Typography>
    </Paper>
  );
};

const StatsSection: React.FC = () => {
  return (
    <Box sx={{ my: 6 }}>
      <Typography 
        variant="h5" 
        sx={{ fontWeight: 'bold', mb: 3 }}
      >
        Dashboard del Día
      </Typography>

      <Grid container spacing={3}>
        {statsData.map((stat, index) => (
          <Grid 
            item 
            xs={12}  // ocupa todo en móvil
            sm={6}   // 2 columnas en tablet
            md={3}   // 4 columnas en desktop
            key={index}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeColor={stat.changeColor}
              icon={stat.icon}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StatsSection;

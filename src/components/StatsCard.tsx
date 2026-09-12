import React, { ReactElement } from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

type PaletteColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon?: ReactElement;
  color?: PaletteColor;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  color = 'primary'
}) => {
  const theme = useTheme();

  return (
    <Card 
      sx={{ 
        height: '100%',
        textAlign: 'center', 
        boxShadow: 3,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        }
      }}
    >
      <CardContent 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%' 
        }}
      >
        {icon && (
          <Box mb={1.5} sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        )}

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        
        <Typography 
          variant="h4" 
          sx={{ 
            color: `${color}.main`, 
            fontWeight: 'bold', 
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' } // 📱 responsivo
          }}
        >
          {value}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;

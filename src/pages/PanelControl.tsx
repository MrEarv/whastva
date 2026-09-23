import * as React from "react";
import config from "../config";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  
  Avatar
} from "@mui/material";

import { motion } from "framer-motion"; 

import QrWhatsapp from "./QrWhatsapp";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions, 
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import zoomPlugin from 'chartjs-plugin-zoom'; 
import { rgba } from "framer-motion";


import ReplayIcon from '@mui/icons-material/Replay';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PanToolIcon from '@mui/icons-material/PanTool';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';

import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ComputerIcon from '@mui/icons-material/Computer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SendIcon from '@mui/icons-material/Send';
import Template from '@mui/icons-material/Inventory';
import { data } from "framer-motion/client";


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  zoomPlugin
);

interface MonthlyData {
  month: string;
  numberOfOders: number;
}

interface DashboardData {
  opened: MonthlyData[];
  pending: MonthlyData[];
  resolved: MonthlyData[];
  activeBot: MonthlyData[];
  dActiveBot: MonthlyData[];
  totalChats: number;
  totalChatbots: number;
  totalContacts: number;
  totalFlows: number;
  totalBroadcast: number;
  totalTemplets: number;
}

interface ChartToolbarProps {
  chartRef: React.MutableRefObject<any>;
  filenameBase: string;
  chartData: any; 
  chartLabels: string[]; 
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({ chartRef, filenameBase, chartData, chartLabels }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleResetZoom = () => { if (chartRef && chartRef.current) chartRef.current.resetZoom(); };
  const handleZoomIn = () => { if (chartRef && chartRef.current) chartRef.current.zoom(1.1); };
  const handleZoomOut = () => { if (chartRef && chartRef.current) chartRef.current.zoom(1/1.1); };

  const handleDownloadPNG = () => {
    if (chartRef && chartRef.current) {
      const a = document.createElement('a');
      a.href = chartRef.current.toBase64Image('image/png', 1);
      a.download = `${filenameBase}.png`;
      a.click();
    }
    handleClose();
  };

  const handleDownloadCSV = () => {
    const data = chartData.datasets;
    const labels = chartLabels;
    let csvContent = "data:text/csv;charset=utf-8,";
    const header = ["Mes"].concat(data.map((d: any) => d.label)).join(",");
    csvContent += header + "\r\n";

    for (let i = 0; i < labels.length; i++) {
        let row = [labels[i]];
        data.forEach((d: any) => { row.push(d.data[i]); });
        csvContent += row.join(",") + "\r\n";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filenameBase}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleClose();
  };

  return (
    <Box>
      <IconButton onClick={handleZoomIn} size="small" aria-label="zoom in" title="Zoom In"><AddCircleOutlineIcon fontSize="small" /></IconButton>
      <IconButton onClick={handleZoomOut} size="small" aria-label="zoom out" title="Zoom Out"><RemoveCircleOutlineIcon fontSize="small" /></IconButton>
      <IconButton size="small" aria-label="selection zoom" title="Selection Zoom (Arrastre)"><SearchIcon fontSize="small" /></IconButton>
      <IconButton size="small" aria-label="panning" title="Panning (Arrastrar y mover)"><PanToolIcon fontSize="small" /></IconButton>
      <IconButton onClick={handleResetZoom} size="small" aria-label="restablecer zoom" title="Restablecer Zoom"><ReplayIcon fontSize="small" /></IconButton>
      
      <IconButton
        aria-label="descargar"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        size="small"
        title="Menú de Descarga"
      >
        <MenuIcon fontSize="small" />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <MenuItem disabled>Descargar SVG (No soportado)</MenuItem> 
        <MenuItem onClick={handleDownloadPNG}>Descargar PNG</MenuItem>
        <MenuItem onClick={handleDownloadCSV}>Descargar CSV</MenuItem>
      </Menu>
    </Box>
  );
};

interface KpiCardProps {
    title: string;
    value: number;
    icon: React.ElementType;
    color: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, color }) => {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.05 }}
        >
            <Paper elevation={6} sx={{ p: 2, borderRadius: 2, height: '100%', borderLeft: `5px solid ${color}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: color }}>
                            {value.toLocaleString()}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
                        <Icon />
                    </Avatar>
                </Box>
            </Paper>
        </motion.div>
    );
};

const PanelControl: React.FC = () => {
  const theme = useTheme();
  const [openQR, setOpenQR] = React.useState(false);
  const [dashboardData, setDashboardData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const activityChartRef = React.useRef<any>(null);
  const metricsChartRef = React.useRef<any>(null);

  React.useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(config.API_URL + "/user/get_dashboard", {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DashboardData = await response.json();
        setDashboardData(data);
        setLoading(false);
      } catch (error: any) {
        console.error("Error al obtener datos:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const activityChartData = dashboardData ? {
    labels: dashboardData.opened.map((item) => item.month),
    datasets: [
      {
        label: 'Chat abierto',
        data: dashboardData.opened.map((item) => item.numberOfOders),
        borderColor: 'rgba(255, 165, 0, 1)', 
        backgroundColor: 'rgba(255, 165, 0, 0.4)',
        fill: true,
      },
      {
        label: 'Chat pendiente',
        data: dashboardData.pending.map((item) => item.numberOfOders),
        borderColor: 'rgba(78, 0, 153, 1)', 
        backgroundColor: 'rgba(78, 0, 153, 0.4)',
        fill: true,
      },
      {
        label: 'Chat resuelto',
        data: dashboardData.resolved.map((item) => item.numberOfOders),
        borderColor: 'rgba(0, 164, 38, 1)', 
        backgroundColor: 'rgba(0, 164, 38, 0.4)',
        fill: true,
      },
    ],
  } : null;

  const additionalMetricsChartData = dashboardData ? {
    labels: dashboardData.activeBot.map((item) => item.month),
    datasets: [
      {
        label: 'Bots Activos',
        data: dashboardData.activeBot.map((item) => item.numberOfOders),
        borderColor: 'rgba(199, 176, 5, 1)',
        backgroundColor: 'rgba(199, 176, 5, 0.4)',
        fill: true,
      },
      {
        label: 'Bots Desactivados',
        data: dashboardData.dActiveBot.map((item) => item.numberOfOders),
        borderColor: 'rgba(0, 143, 105, 0.99)',
        backgroundColor: 'rgba(0, 143, 105, 0.4)',
        fill: true,
      },
    ],
  } : null;

  const chartOptions: ChartOptions<'line'> = { 
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      datalabels: {
        display: true,
        color: theme.palette.text.primary,
        font: {
          weight: 'bold' as const,
          size: 12,
        },
        align: 'end' as const,
        anchor: 'end' as const,
        formatter: (value: any) => value > 0 ? value : '',
      },

      legend: {
        display: true,
        position: 'top' as const, 
      },
      zoom: {
        pan: { enabled: true, mode: 'x' as const },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          drag: { enabled: true, backgroundColor: 'rgba(66,133,244,0.3)' },
          mode: 'x' as const, 
        }
      }
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">  
          Error al cargar los datos: {error}
        </Typography>
      </Box>
    );
  }

  const activityLabels = dashboardData ? dashboardData.opened.map(item => item.month) : [];
  const metricsLabels = dashboardData ? dashboardData.activeBot.map(item => item.month) : [];

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}    
        transition={{ type: "spring", stiffness: 150, damping: 15 }}     
      >
        <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
          Panel de Control
        </Typography>
      </motion.div>
      
      <Divider sx={{ mb: 4, bgcolor: theme.palette.divider }} />
      <QrWhatsapp open={openQR} onClose={() => setOpenQR(false)} />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Resumen General
          </Typography>
         
        </Grid>
        

        <Grid item xs={12} sm={6} md={2}>
            <KpiCard 
                title="Total de chats" 
                value={dashboardData?.totalChats || 0} 
                icon={ChatBubbleOutlineIcon} 
                color={theme.palette.success.main} 
            />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
            <KpiCard 
                title="Total de contactos" 
                value={dashboardData?.totalContacts || 0} 
                icon={ContactMailIcon} 
                color={theme.palette.info.main} 
            />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
            <KpiCard 
                title="Total de chatbots" 
                value={dashboardData?.totalChatbots || 0} 
                icon={ComputerIcon} 
                color={theme.palette.warning.main} 
            />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
            <KpiCard 
                title="Total de flujos" 
                value={dashboardData?.totalFlows || 0} 
                icon={TrendingUpIcon} 
                color={theme.palette.secondary.main} 
            />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
            <KpiCard 
                title="Total de plantillas" 
                value={dashboardData?.totalTemplets || 0} 
                icon={Template} 
                color={theme.palette.primary.main} 
            />
        </Grid>
      </Grid>
      
      
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={6} sx={{ p: 4, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Actividad de chats</Typography>
              <ChartToolbar 
                chartRef={activityChartRef}
                filenameBase="actividad_chats"
                chartData={activityChartData}
                chartLabels={activityLabels}
              />
            </Box>
            <Box sx={{ width: '100%', height: 'calc(100vh - 450px)' }}>
              {activityChartData && <Line ref={activityChartRef} options={chartOptions} data={activityChartData} />} 
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={6} sx={{ p: 4, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Métricas adicionales</Typography>
              <ChartToolbar 
                chartRef={metricsChartRef}
                filenameBase="metricas_adicionales"
                chartData={additionalMetricsChartData}
                chartLabels={metricsLabels}
              />
            </Box>
            <Box sx={{ width: '100%', minHeight: '300px' }}>
              {additionalMetricsChartData && <Line ref={metricsChartRef} options={chartOptions} data={additionalMetricsChartData} />}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PanelControl;
import React, { useState, useEffect } from 'react';
import config from '../config';
import { useNavigate } from "react-router-dom"; // Importado
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Box,
    Typography,
    IconButton,
    Grid,
    Chip,
    Button,
    Card,
    CardContent,
    CardActions,
    useTheme,
    Divider,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ApiIcon from "@mui/icons-material/Api";
import AdbIcon from "@mui/icons-material/Adb";
import ChatIcon from "@mui/icons-material/Chat";
import ContactsIcon from "@mui/icons-material/Contacts";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PriceCheckIcon from '@mui/icons-material/PriceCheck';
import StarIcon from '@mui/icons-material/Star';

interface SubscriptionModalProps {
    open: boolean;
    onClose: () => void;
}

interface Plan {
    title: string;
    price: string;
    oldPrice: string;
    days: number;
    features: string[];
}

interface PlanCardProps extends Plan {
    onSelectPlan: (plan: Plan) => void;
}

interface SubscriptionItemProps {
    icon: React.ReactNode;
    label: string;
    value: boolean | number | string; 
}


  const fetchAllPlans = async () => {
    try {
      const response = await fetch(config.API_URL+"/plan/get_all", {
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
            },
      })
      const data = await response.json();
      console.log(data);
    } catch (error){
      console.log(error);
    }
  }

  fetchAllPlans();


const SubscriptionItem: React.FC<SubscriptionItemProps> = ({ icon, label, value }) => {
    const isCheck = value === true;
    const isNumber = typeof value === "number";
    const isString = typeof value === "string";
    const theme = useTheme();

    return (
        <Box 
            sx={{ 
                borderBottom: `1px solid ${theme.palette.divider}`,
                py: 1.5,
                '&:last-child': {
                    borderBottom: 'none', 
                }
            }}
        >
            <Grid container alignItems="center">
                <Grid item xs={2} sx={{ color: theme.palette.primary.main }}> 
                    {icon}
                </Grid>
                <Grid item xs={7}>
                    <Typography variant="body2">{label}</Typography>
                </Grid>
                <Grid item xs={3} sx={{ display: "flex", justifyContent: "flex-end" }}>
                    {isCheck ? (
                        <CheckCircleOutlineIcon color="success" sx={{ fontSize: 20 }} />
                    ) : isNumber || isString ? (
                        <Chip
                            label={value}
                            size="small"
                            sx={{
                                backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[700],
                                color: theme.palette.text.primary,
                                fontWeight: "normal",
                                fontSize: '0.7rem'
                            }}
                        />
                    ) : null}
                </Grid>
            </Grid>
        </Box>
    );
};

const PlanCard: React.FC<PlanCardProps> = ({
    title,
    price,
    oldPrice,
    days,
    features,
    onSelectPlan,
}: PlanCardProps) => {
    const theme = useTheme();
    
    const isPremium = title === "Everything"; 
    const accentColor = isPremium ? theme.palette.primary.main : theme.palette.primary.main;

    const handleStartClick = () => {
        onSelectPlan({ title, price, oldPrice, days, features });
    };

    return (
        <Card
            sx={{
                p: 0,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: theme.shadows[2],
                border: `1px solid ${theme.palette.divider}`,
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                }
            }}
            onClick={handleStartClick}
        >
            <Box sx={{ 
                height: 8, 
                backgroundColor: accentColor, 
                width: '100%',
                mb: 2 
            }} />

            <CardContent sx={{ flexGrow: 1, p: 3, pt: 0 }}>
                <Typography variant="h5" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {title}
                </Typography>
                
                <Box sx={{ my: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {oldPrice !== price && (
                        <Typography 
                            variant="body1" 
                            component="span" 
                            sx={{ 
                                textDecoration: 'line-through', 
                                color: 'gray',
                                mb: 0.5
                            }}
                        >
                            {oldPrice}
                        </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <PriceCheckIcon sx={{ fontSize: 30, mr: 1, color: accentColor }} />
                        <Typography variant="h3" component="span" sx={{ fontWeight: 'bold', color: accentColor }}>
                            {price}
                        </Typography>
                    </Box>
                </Box>
                
                <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                    {days} Días de Acceso
                </Typography>
                
                {features.map((feature: string, index: number) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                        <CheckCircleOutlineIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
                        <Typography variant="body2">{feature}</Typography>
                    </Box>
                ))}
            </CardContent>

            <CardActions sx={{ justifyContent: 'center', p: 3, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    onClick={(e) => {
                        e.stopPropagation();
                        handleStartClick();
                    }}
                    sx={{
                        borderRadius: "999px",
                        py: 1.5,
                        backgroundColor: accentColor,
                        color: 'white',
                        fontWeight: 'bold',
                        transition: 'all 0.3s',
                        "&:hover": {
                            backgroundColor: isPremium ? theme.palette.primary.dark : theme.palette.primary.dark,
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[6],
                        },
                    }}
                >
                    <ShoppingCartIcon sx={{ mr: 1 }} />
                    COMENZAR
                </Button>
            </CardActions>
        </Card>
    );
};

const plans: Plan[] = [
    {
        title: "Everything",
        price: "$39",
        oldPrice: "$3999",
        days: 39,
        features: [
            "Instancias de WhatsApp (10)",
            "Calentador de WhatsApp",
            "Límite de agenda telefónica (399)",
            "Etiquetas de chat (1)",
            "Notas de chat (1)",
            "Chatbot",
            "Acceso API",
        ],
    },
    {
        title: "Trial",
        price: "$0",
        oldPrice: "$0",
        days: 10,
        features: [
            "Instancias de WhatsApp (99)",
            "Calentador de WhatsApp",
            "Límite de agenda telefónica (999)",
            "Etiquetas de chat (1)",
            "Notas de chat (1)",
            "Chatbot",
            "Acceso API",
        ],
    },
    {
        title: "Basic",
        price: "$19",
        oldPrice: "$99",
        days: 30,
        features: [
            "Instancias de WhatsApp (1)",
            "Calentador de WhatsApp",
            "Límite de agenda telefónica (99)",
            "Etiquetas de chat (1)",
            "Notas de chat (1)",
            "Chatbot",
            "Acceso API",
        ],
    },
    {
        title: "Full",
        price: "$20",
        oldPrice: "$50",
        days: 30,
        features: [
            "Instancias de WhatsApp (30)",
            "Calentador de WhatsApp",
            "Límite de agenda telefónica (30000)",
            "Etiquetas de chat (1)",
            "Notas de chat (1)",
            "Chatbot",
            "Acceso API",
        ],
    },
];


const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    open,
    onClose,
}) => {
    const [plansOpen, setPlansOpen] = useState(false);
    const theme = useTheme();
    const navigate = useNavigate();
    const handleViewPlans = () => {
        setPlansOpen(true);
    };

    const handlePlansClose = () => {
        setPlansOpen(false);
    };

    const handleSelectPlan = (plan: Plan) => {
        onClose(); 
        handlePlansClose();
        
        const planTitleParam = encodeURIComponent(plan.title);
        
        navigate(`/panel/pago?plan=${planTitleParam}`);
    };

    const currentOpen = open && !plansOpen;

    return (
        <React.Fragment>

            <Dialog
                open={currentOpen}
                onClose={onClose}
                maxWidth="xs"
                fullWidth
                sx={{ '& .MuiDialog-paper': { borderRadius: 3 } }} 
            >
                <DialogTitle sx={{ m: 0, p: 2, pb: 0 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" fontWeight="bold">Estado de Suscripción</Typography>
                        <IconButton
                            aria-label="close"
                            onClick={onClose}
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                                color: theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                
                <Divider sx={{ my: 1 }} /> 

                <DialogContent sx={{ p: 0 }}>
                    <Box 
                        sx={{ 
                            p: 2, 
                            display: "flex", 
                            alignItems: "center", 
                            backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.light + '10' : theme.palette.primary.dark + '30',
                            color: theme.palette.text.primary,
                        }}
                    >
                        <StarIcon color="primary" sx={{ mr: 1.5, fontSize: 30 }} /> 
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            Te has suscrito al Plan Trial
                        </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2 }}>

                        <SubscriptionItem icon={<WhatsAppIcon />} label="Calentador de WhatsApp" value={true} />
                        <SubscriptionItem icon={<WhatsAppIcon />} label="Instancias de WhatsApp" value={99} />
                        <SubscriptionItem icon={<ApiIcon />} label="API de Acceso" value={true} />
                        <SubscriptionItem icon={<AdbIcon />} label="Chatbot" value={true} />
                        <SubscriptionItem icon={<ChatIcon />} label="Notas de chat" value={true} />
                        <SubscriptionItem icon={<ChatIcon />} label="Etiquetas de chat" value={true} />
                        <SubscriptionItem icon={<ContactsIcon />} label="Límite de agenda telefónica" value={999} />
                        <SubscriptionItem icon={<AccessTimeIcon />} label="Días restantes del plan" value="en 2 días" />
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} /> 
                    
                    <Box sx={{ p: 2, pt: 0, textAlign: "center" }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleViewPlans}
                            sx={{
                                borderRadius: "999px",
                                py: 1.5,
                                backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.primary.light,
                                color: 'white',
                                transition: 'background-color 0.2s, box-shadow 0.2s',
                                "&:hover": {
                                    backgroundColor: theme.palette.primary.dark,
                                    boxShadow: theme.shadows[8],
                                },
                            }}
                        >
                            <Box component="span" role="img" aria-label="star" sx={{ mr: 1 }}>
                                ✨
                            </Box>
                            EXPLORAR OTROS PLANES
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog
                open={plansOpen}
                onClose={handlePlansClose}
                maxWidth="xl"
                fullWidth
                sx={{ "& .MuiDialog-paper": { mx: 2, my: 2 } }}
            >
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography variant="h5" fontWeight="bold">Elige tu Plan de Crecimiento</Typography>
                            <Typography variant="body2" color="text.secondary">Una opción para cada etapa de tu negocio.</Typography>
                        </Box>
                        <IconButton
                            aria-label="close"
                            onClick={handlePlansClose}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ borderColor: 'divider', p: 4 }}>
                    <Grid container spacing={4} justifyContent="center" alignItems="stretch">
                        {plans.map((plan, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <PlanCard {...plan} onSelectPlan={handleSelectPlan} />
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

export default SubscriptionModal;
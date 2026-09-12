import React, { useCallback } from 'react';
import config from '../config';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Chip,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    CircularProgress,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import Badge from '@mui/material/Badge';

const fechaHora = new Date().toLocaleString("es-MX", { hour12: false });

const INTERVALO_MONITOREO = 20000;


interface Instance {
    id: string;
    name: string;
    isAvailable: boolean;
    userName: string;
    userId: string;
    uid: string;
    instance_id: string;
    title: string;
    status: string;
    webhook: string | null;
    userData: any;
    jid: string | null;
    a_status: string | null;
    createdAt: string;
    qr?: string;
}

interface StatusResponse {
    success: boolean;
    status: boolean; 
    qr?: string; 
    userData?: {
        id: string;
    };
    msg?: string;
}

const initialInstances: Instance[] = [];

const InstancesPage = () => {
    const [instances, setInstances] = React.useState<Instance[]>(initialInstances);
    const [openDialog, setOpenDialog] = React.useState(false);

    const [qrCodeImage, setQrCodeImage] = React.useState<string | null>(null);
    const [qrLoading, setQrLoading] = React.useState(false);
    const [instanceIdAfterAdd, setInstanceIdAfterAdd] = React.useState<string | null>(null);
    

    const [sessionIdForStatus, setSessionIdForStatus] = React.useState<string | null>(null); 
    const [isMonitoring, setIsMonitoring] = React.useState(false); 
    const [connectionState, setConnectionState] = React.useState<'SCAN' | 'CONNECTING' | 'CONNECTED'>('SCAN');


    const [newInstance, setNewInstance] = React.useState({
        title: '',
        syncMax: false,
    });
    const [addLoading, setAddLoading] = React.useState(false);

    const handleOpenDialog = () => {
        setNewInstance({ title: '', syncMax: false });
        setQrCodeImage(null);
        setInstanceIdAfterAdd(null);
        setSessionIdForStatus(null);
        setIsMonitoring(false);
        setConnectionState('SCAN');
        setOpenDialog(true);
    };
    
    const handleCloseDialog = () => {
        setIsMonitoring(false);
        setOpenDialog(false);
    };

    const fetchInstancias = useCallback(async () => {
        try {
            const response = await fetch(config.API_URL + '/session/get_mine', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
            });

            if (!response.ok) {
                console.error('API request failed with status:', response.status);
                return;
            }

            const data = await response.json();
            let rawInstances: any[] = [];
            if (data && Array.isArray(data.instances)) {
                rawInstances = data.instances;
            } else if (Array.isArray(data)) {
                rawInstances = data;
            } else if (data && Array.isArray(data.data)) {
                rawInstances = data.data;
            } else {
                console.error("Fetched data is not in a recognized array format:", data);
                return;
            }

            const mappedInstances: Instance[] = rawInstances.map((inst: any) => {
                let parsedUserData = { id: '', name: '' };
                
                if (inst.userData) {
                    try {
                        const userData = typeof inst.userData === 'string' ? JSON.parse(inst.userData) : inst.userData;
                        parsedUserData.id = (userData.id && typeof userData.id === 'string') ? userData.id.split(':')[0].replace(/@.*$/, '') : userData.id || '';
                        parsedUserData.name = userData.name || '';
                    } catch (e) {
                        console.error("Error parsing userData for instance:", inst.id, inst.userData, e);
                    }
                }
                
                const status = (inst.status || '').toUpperCase();
                const isAvailable = status === 'CONNECTED' || status === 'LOGGEDIN' || status === 'ACTIVE';

                return {
                    ...inst,
                    name: inst.title,
                    id: inst.instance_id || inst.id, 
                    isAvailable: isAvailable, 
                    userId: parsedUserData.id,
                    userName: parsedUserData.name,
                } as Instance; 
            });

            setInstances(mappedInstances);

        } catch (error) {
            console.error("Error fetching or parsing instances:", error);
        }
    }, []);

    React.useEffect(() => {
        fetchInstancias();
    }, [fetchInstancias]);


    const fetchStatus = useCallback(async (sessionId: string) => {
        setConnectionState('CONNECTING');
try {
    const response = await fetch(config.API_URL + '/session/status', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
        body: JSON.stringify({ id: sessionId }),
    });

    const resp = await response.json();

    if (!response.ok || resp.estatus === false) {
        throw new Error(resp.mensaje || "Error de la API al consultar el estado.");
    }

    const { data } = resp;

    if (data?.success === true && data?.status === true) {
        setIsMonitoring(false);
        setConnectionState('CONNECTED');
        handleCloseDialog();
        fetchInstancias();
        return true;
    }

    if (data?.qr) {
        setQrCodeImage(data.qr);
        setConnectionState('SCAN');
    } else {
        setConnectionState('SCAN');
    }

    return false;

} catch (error) {
    console.error("Error al monitorear el estado:", error);
    setIsMonitoring(false);
    setConnectionState('SCAN');
    return false;
}
    }, [instanceIdAfterAdd, fetchInstancias, handleCloseDialog]); 

const fetchQrCode = async (payload: { title: string; syncMax: boolean }) => {
    setQrLoading(true);
    setQrCodeImage(null);

    try {
        const requestBody = {
            fecha: fechaHora,
            auth: localStorage.getItem("token") || "",
            accion: "Crear QR",
            ...payload
        };

        const response = await fetch(config.API_URL + "/session/create_qr", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
            body: JSON.stringify(requestBody),
        });

        const api = await response.json();
        const responseData = api.data || api;

        const qrUrl =
            responseData.qrCodeUrl ||
            responseData.url ||
            responseData.qr ||
            null;

        const sessionId =
            responseData.sessionId ||
            responseData.id ||
            null;

        if (qrUrl && sessionId) {
            setQrCodeImage(qrUrl);
            setSessionIdForStatus(sessionId);
            setIsMonitoring(true);
            setConnectionState("SCAN");
        } else {
            console.error("API response missing QR URL or SessionID:", api);
            alert("La respuesta del API no contiene una URL de QR o SessionID válida.");
        }

        return api;

    } catch (error: any) {
        console.error("Error al obtener el código QR:", error);
        alert(`Error al obtener el código QR: ${error.message}. Intenta de nuevo.`);
        setSessionIdForStatus(null);
    } finally {
        setQrLoading(false);
    }
};

   
    const handleAddInstance = async () => {
        if (!newInstance.title) {
            alert('El nombre de la instancia (title) es obligatorio.');
            return;
        }

        setAddLoading(true);

        try {
            const payload = {
                title: newInstance.title,
                syncMax: newInstance.syncMax
            };
            
            setInstanceIdAfterAdd(newInstance.title); 
            await fetchQrCode(payload);

        } catch (error) {
            console.error('Error en el flujo de QR/Creación:', error);
            setInstanceIdAfterAdd(null);
            setSessionIdForStatus(null);
            setIsMonitoring(false);
        } finally {
            setAddLoading(false);
        }
    };

    React.useEffect(() => {
        let interval: any = null; 

        if (isMonitoring && sessionIdForStatus && openDialog) {
            
            const pollStatus = async () => {
                await fetchStatus(sessionIdForStatus); 
            };
            interval = setInterval(pollStatus, INTERVALO_MONITOREO);
        } else if (interval) {
            clearInterval(interval);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isMonitoring, sessionIdForStatus, openDialog, fetchStatus]); 


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        setNewInstance((prev) => ({
            ...prev,
            [name]: name === 'syncMax' ? checked : value,
        }));

        if (name === 'title') {
            setQrCodeImage(null);
            setInstanceIdAfterAdd(null);
        }
    };
    
    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
        alert(`ID "${id}" copiado al portapapeles.`);
    };

    const handleDeleteInstance = async (id: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar esta instancia?`)) {
            try {
                const response = await fetch(config.API_URL + '/session/del_ins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + localStorage.getItem('token'),
                },
                body: JSON.stringify({
                    fecha: fechaHora,
                    auth: localStorage.getItem("token") || "",
                    accion: "Eliminar instancia",
                    data: {
                        id: id
                    }
                }),
            });


                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API request failed with status:', response.status, 'Response:', errorText);
                    alert(`Error al eliminar la instancia: ${response.statusText}. Respuesta: ${errorText}`);
                    return;
                }

                setInstances((prev) => prev.filter((inst) => inst.id !== id));
                alert('Instancia eliminada correctamente');

            } catch (error) {
                console.error('Error deleting instance:', error);
                alert('Ocurrió un error al eliminar la instancia.');
            }
        }
    };
    

    return (
        <Box sx={{ p: 0 }}>
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    backgroundColor: (theme) => theme.palette.background.default,
                    pb: 2,
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold">
                        Instancias de administrador
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={handleOpenDialog}
                            sx={{
                                bgcolor: '#000',
                                color: '#fff',
                                '&:hover': { bgcolor: '#333' },
                                borderRadius: '8px',
                                mr: 2,
                            }}
                        >
                            Agregar instancia
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {instances.map((instance) => (
                    <Grid item xs={12} key={instance.id}>
                        <Paper elevation={3} sx={{
                            p: 3,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Badge
                                    color={instance.isAvailable ? "success" : "error"}
                                    variant="dot"
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                    overlap="circular"
                                >
                                    <WhatsAppIcon sx={{ fontSize: 48, color: instance.isAvailable ? '#25D366' : '#1fab50ff' }} />
                                </Badge>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {instance.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                        <Chip
                                            label={instance.isAvailable ? 'disponible' : (instance.status || 'desconectado')}
                                            size="small"
                                            sx={{
                                                bgcolor: instance.isAvailable ? '#e6ffe6' : '#f4f4f4',
                                                color: instance.isAvailable ? '#1a6f1a' : '#666',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: { xs: 0, sm: 'auto' } }}>
                                <Box sx={{ textAlign: 'right', mr: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} /> {instance.userName || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        #{instance.userId || 'N/A'}
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteOutlineIcon />}
                                        onClick={() => handleDeleteInstance(instance.id)}
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        Eliminar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ContentCopyIcon />}
                                        onClick={() => handleCopyId(instance.id)}
                                        sx={{ borderRadius: '8px' }}
                                    >
                                        Copiar ID
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {instances.length === 0 && (
                <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 5 }}>
                    No hay instancias activas. Agrega una para comenzar.
                </Typography>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {instanceIdAfterAdd ? `Conectar Instancia: ${instanceIdAfterAdd}` : 'Agregar nueva instancia'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={qrCodeImage || qrLoading ? 6 : 12}
                            sx={{
                                transition: 'width 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    name="title"
                                    label="Nombre de la instancia"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={newInstance.title}
                                    onChange={handleInputChange}
                                    sx={{ mb: 2 }}

                                    disabled={addLoading || !!instanceIdAfterAdd || isMonitoring} 
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            name="syncMax"
                                            checked={newInstance.syncMax}
                                            onChange={handleInputChange}
                                        />
                                    }
                                    label="Sincronizar WhatsApp profundamente"
                                    sx={{ mt: 1 }}
                                    disabled={addLoading || !!instanceIdAfterAdd || isMonitoring}
                                />
                                
                            </Box>
                            <Box sx={{ mt: 3 }}>
                                <Button
                                    onClick={handleAddInstance}
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        bgcolor: '#000',
                                        '&:hover': { bgcolor: '#333' },
                                        borderRadius: '8px'
                                    }}
                                    disabled={!newInstance.title || addLoading || !!instanceIdAfterAdd}
                                >
                                    {addLoading ? <CircularProgress size={24} color="inherit" /> : 'Generar Código QR'}
                                </Button>
                            </Box>
                        </Grid>

<Grid item xs={12} sm={6}>
     { (qrCodeImage || qrLoading) && (
     <Paper
         elevation={3}
             sx={{
                 p: 2,
                 borderRadius: '12px',
                textAlign: 'center',
                minHeight: 250,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {qrLoading || connectionState === 'CONNECTING' ? (
                                        <Box sx={{ p: 3 }}>
                                            <CircularProgress color="primary" />
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {qrLoading ? 'Generando código QR...' : 'Verificando estado...'}
                                            </Typography>
                                        </Box>
                                    ) : qrCodeImage ? (
                                        <Box>
                                            <img
                                                src={qrCodeImage}
                                                alt={`Código QR para ${instanceIdAfterAdd}`}
                                                style={{ width: 180, height: 180, display: 'block', margin: '0 auto' }}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                                QR se refrescará automáticamente.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography color="error">No se pudo cargar el QR. Intenta de nuevo.</Typography>
                                    )}
                                </Paper>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button 
                        onClick={handleCloseDialog} 
                        color="primary" 
                        disabled={addLoading || qrLoading}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default InstancesPage;
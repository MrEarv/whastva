import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper, IconButton,
  Select, MenuItem, FormControl, InputLabel, Grid, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, OutlinedInput
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CampaignIcon from "@mui/icons-material/Campaign";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import config from "../config.json";

export default function Broadcast() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [phonebooks, setPhonebooks] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [instances, setInstances] = useState<any[]>([]);
  
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [selectedPhonebook, setSelectedPhonebook] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>("");
  const [selectedInstances, setSelectedInstances] = useState<string[]>([]);
  const [delayFrom, setDelayFrom] = useState(10);
  const [delayTo, setDelayTo] = useState(30);
  const [scheduleDate, setScheduleDate] = useState("");

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const loadData = async () => {
    try {
      const [campRes, pbRes, tplRes, insRes] = await Promise.all([
        fetch(`${config.API_URL}broadcast/my_broadcast`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${config.API_URL}user/get_phonebooks`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${config.API_URL}templet/my_templet`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${config.API_URL}session/get_instances_with_status`, { headers: getHeaders() }).then(r => r.json())
      ]);

      if (campRes.success) setCampaigns(campRes.data);
      if (pbRes.success) setPhonebooks(pbRes.data);
      if (tplRes.success) setTemplates(tplRes.data);
      if (insRes.success) setInstances(insRes.data.map((d: any) => d.i));
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    loadData(); 
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenAdd = () => {
    setTitle("");
    setSelectedPhonebook("");
    setSelectedTemplate("");
    setSelectedInstances([]);
    setDelayFrom(10);
    setDelayTo(30);
    setScheduleDate("");
    setOpenAdd(true);
  };

  const handleCreateCampaign = async () => {
    if (!title || !selectedTemplate || !selectedPhonebook || selectedInstances.length === 0) {
      alert("Por favor llena todos los campos requeridos.");
      return;
    }

    setLoading(true);
    try {
      const scheduleTimestamp = scheduleDate ? new Date(scheduleDate).getTime() : Date.now();

      const payload = {
        title,
        templet: selectedTemplate,
        phonebook: { phonebook_id: selectedPhonebook },
        instance_id: selectedInstances,
        delay_from: delayFrom,
        delay_to: delayTo,
        schedule: !!scheduleDate, 
        scheduleTimestamp: scheduleTimestamp,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const response = await fetch(`${config.API_URL}broadcast/add_broadcast`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (data.success) {
        setOpenAdd(false);
        loadData();
      } else {
        alert(data.msg || "Error al crear la campaña");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (broadcast_id: string) => {
    if (!window.confirm("¿Eliminar esta campaña?")) return;
    try {
      const response = await fetch(`${config.API_URL}broadcast/del_broadcast`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ broadcast_id })
      });
      const data = await response.json();
      if (data.success) {
        loadData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Campañas (Broadcasts)</Typography>
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleOpenAdd}>
          Nueva Campaña
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Título</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Creada el</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Programada para</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>No hay campañas registradas.</TableCell>
              </TableRow>
            ) : (
              campaigns.map((camp) => (
                <TableRow key={camp.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{camp.title}</TableCell>
                  <TableCell>
                    <Chip size="small" label={camp.status} color={camp.status === "PENDING" ? "warning" : "success"} />
                  </TableCell>
                  <TableCell>{new Date(camp.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(camp.schedule).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => handleDelete(camp.broadcast_id)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* DIÁLOGO CREAR CAMPAÑA */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight="bold">Lanzar Nueva Campaña</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre de la campaña" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                type="datetime-local" 
                label="Programar envío (Opcional: déjalo vacío para enviar ahora)" 
                InputLabelProps={{ shrink: true }}
                value={scheduleDate} 
                onChange={(e) => setScheduleDate(e.target.value)} 
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Agenda Telefónica</InputLabel>
                <Select value={selectedPhonebook} onChange={(e) => setSelectedPhonebook(e.target.value)} input={<OutlinedInput label="Agenda Telefónica" />}>
                  {phonebooks.map((pb) => (
                    <MenuItem key={pb.id} value={pb.id}>{pb.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Plantilla (Template)</InputLabel>
                <Select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} input={<OutlinedInput label="Plantilla (Template)" />}>
                  {templates.map((tpl) => (
                    <MenuItem key={tpl.id} value={tpl}>{tpl.title} ({tpl.type})</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Instancias Emisoras</InputLabel>
                <Select multiple value={selectedInstances} onChange={(e) => setSelectedInstances(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)} input={<OutlinedInput label="Instancias Emisoras" />} renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const ins = instances.find(i => i.instance_id === value);
                      return <Chip key={value} label={ins?.title || value} size="small" />;
                    })}
                  </Box>
                )}>
                  {instances.map((ins) => (
                    <MenuItem key={ins.instance_id} value={ins.instance_id}>{ins.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Retraso Min (seg)" value={delayFrom} onChange={(e) => setDelayFrom(Number(e.target.value))} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth type="number" label="Retraso Max (seg)" value={delayTo} onChange={(e) => setDelayTo(Number(e.target.value))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAdd(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateCampaign} disabled={loading} startIcon={<CampaignIcon />}>
            {loading ? "Lanzando..." : "Lanzar Campaña"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
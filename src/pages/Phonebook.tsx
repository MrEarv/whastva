// Phonebook.tsx
import React, { useState, useEffect, useCallback } from "react"
import {
  Box, Card, CardContent, Typography, TextField, Button, Divider, Table, TableHead,
  TableBody, TableRow, TableCell, TableContainer, Paper, IconButton, Checkbox, Toolbar,
  TablePagination, Chip, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment,
  Tabs, Tab, Snackbar, Alert, Menu, MenuItem, Stack,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import DownloadIcon from "@mui/icons-material/Download"
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined"
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined"
import phonebookImg from "../images/contact.svg"
import config from "../config.json"

const fechaHora = new Date().toLocaleString("es-MX", { hour12: false });

// =================================================================
//LÓGICA DE API 
// =================================================================

const getApiHeaders = () => {
  const headers: Record<string, string> = { "Content-Type": "application/json", "Accept": "application/json" }
  const token = localStorage.getItem("token")
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }
  return headers
}

const handleResponse = async (response: Response) => {
  const data = await response.json()
  if (!response.ok || !data.estatus) {
    throw new Error(data.mensaje || data.msg || "Error en la solicitud a la API")
  }
  return data
}

const apiService = {
  getPhonebooks: async () => {
    const response = await fetch(`${config.API_URL}user/get_phonebooks`, {
      method: 'GET',
      headers: getApiHeaders(),
    })
    return handleResponse(response)
  },

  getContacts: async (phonebookId: string) => {
    const response = await fetch(`${config.API_URL}user/get_contacts?phonebook_id=${phonebookId}`, {
      method: 'GET',
      headers: getApiHeaders(),
    })
    return handleResponse(response)
  },

addPhonebook: async (title: string) => {
  const payload = {
    fecha: fechaHora,
    auth: localStorage.getItem("token"),
    accion: "Crear agenda telefonica",
    data: {
      title
    }
  };

  const response = await fetch(`${config.API_URL}user/add_phonebook`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(payload),
  });
  
  return handleResponse(response);
},

updatePhonebook: async (payload: any) => {

  const requestBody = {
    fecha: fechaHora,
    auth: localStorage.getItem("token"),
    accion: "Actualizar agenda telefonica",
    data: {
      payload
    }
  };

  const response = await fetch(`${config.API_URL}user/update_phonebook`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(requestBody),
  });

  return handleResponse(response);
},

deletePhonebook: async (id: number) => {
  const response = await fetch(`${config.API_URL}user/del_book`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify({
      fecha: new Date().toISOString(),
      auth: localStorage.getItem("token") || null,
      accion: "Eliminar agenda telefónica",
      data: {
        payload: { id }
      }
    }),
  });

  return handleResponse(response);
},


addContact: async (payload: any) => {
  const requestBody = {
    fecha: new Date().toISOString(),   // o usa tu formato fechaHora si lo tienes global
    auth: localStorage.getItem("token"),
    accion: "Agregar contacto",
    data: payload
  };

  const response = await fetch(`${config.API_URL}user/add_contact`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(requestBody),
  });

  return handleResponse(response);
},


updateContact: async (payload: any) => {
  const response = await fetch(`${config.API_URL}user/update_contact_number`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify({
      fecha: new Date().toISOString(),
      auth: localStorage.getItem("token") || null,
      accion: "Actualizar contacto",
      data: {
        payload
      }
    }),
  });

  return handleResponse(response);
},

deleteContacts: async (ids: number[]) => {           // acción de la operación

  const payload = {
    fecha: fechaHora,
    auth: localStorage.getItem("token"),
    accion: "Eliminar contacto(s)",
    data: {
      selected: ids,    // <-- aquí van los IDs a eliminar
    },
  };

  const response = await fetch(`${config.API_URL}user/del_contacts`, {
    method: "POST",
    headers: getApiHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
},
}

// =================================================================
// TIPOS Y FUNCIONES AUXILIARES
// =================================================================

export type Agenda = {
  id: string
  name: string
  createdAt?: string
  phonebook_id?: string
  uid: string
  rawId: number
}

export type Contact = {
  id: string
  agendaId: string
  contactName: string
  phone: string
  var1?: string
  var2?: string
  var3?: string
  var4?: string
  var5?: string
  date?: string
}

const fmt = (dIso?: string) => {
  if (!dIso) return "-"
  const d = new Date(dIso)
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`
}


// =================================================================
// COMPONENTES DE DIÁLOGO
// =================================================================

type AddContactDialogProps = {
  open: boolean
  agenda?: Agenda
  onClose: () => void
  onSubmitMany: (rows: Omit<Contact, "id" | "date">[]) => void
}
const AddContactDialog: React.FC<AddContactDialogProps> = ({ open, agenda, onClose, onSubmitMany }) => {
  const [tab, setTab] = React.useState<0 | 1>(0)
  const [contactName, setContactName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [vars, setVars] = React.useState({ var1: "", var2: "", var3: "", var4: "", var5: "" })
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setTab(0)
      setContactName("")
      setPhone("")
      setVars({ var1: "", var2: "", var3: "", var4: "", var5: "" })
      setError(null)
    }
  }, [open])

  const submitSingle = () => {
    if (!contactName.trim() || !phone.trim()) {
      setError("Nombre y número son obligatorios.")
      return
    }
    onSubmitMany([
      {
        agendaId: agenda?.phonebook_id ?? agenda?.id ?? "",
        contactName: contactName.trim(),
        phone: phone.trim(),
        ...vars,
      },
    ])
    onClose()
  }
  const onCSV = async (file: File) => {
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== "")
      if (lines.length < 2) {
        setError("El CSV no tiene datos.")
        return
      }
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
      const idx = {
        name: headers.indexOf("name") !== -1 ? headers.indexOf("name") : headers.indexOf("nombre"),
        phone: headers.indexOf("phone") !== -1 ? headers.indexOf("phone") : headers.indexOf("numero"),
        var1: headers.indexOf("var1"),
        var2: headers.indexOf("var2"),
        var3: headers.indexOf("var3"),
        var4: headers.indexOf("var4"),
        var5: headers.indexOf("var5"),
      }
      if (idx.name === -1 || idx.phone === -1) {
        setError('El CSV debe incluir columnas "name" y "phone".')
        return
      }
      const out: Omit<Contact, "id" | "date">[] = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",")
        const n = (cols[idx.name] || "").trim()
        const p = (cols[idx.phone] || "").trim()
        if (!n || !p) continue
        out.push({
          agendaId: agenda?.phonebook_id ?? agenda?.id ?? "",
          contactName: n,
          phone: p,
          var1: idx.var1 === -1 ? "" : (cols[idx.var1] || "").trim(),
          var2: idx.var2 === -1 ? "" : (cols[idx.var2] || "").trim(),
          var3: idx.var3 === -1 ? "" : (cols[idx.var3] || "").trim(),
          var4: idx.var4 === -1 ? "" : (cols[idx.var4] || "").trim(),
          var5: idx.var5 === -1 ? "" : (cols[idx.var5] || "").trim(),
        })
      }
      if (!out.length) {
        setError("No se pudo leer ningún registro del CSV.")
        return
      }
      onSubmitMany(out)
      onClose()
    } catch (e: any) {
      setError(e?.message ?? "Error al leer CSV")
    }
  }

  const downloadTemplate = () => {
    const tpl = "name,phone,var1,var2,var3,var4,var5"
    const blob = new Blob([tpl], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_contactos.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Agregando número {agenda ? `(${agenda.name})` : ""}</DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Escribiendo" />
          <Tab label="Por CSV" />
        </Tabs>
        {tab === 0 && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Nombre del contacto"
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Número telefónico (agregue el código de país)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">+</InputAdornment> }}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="var1"
                value={vars.var1}
                onChange={e => setVars({ ...vars, var1: e.target.value })}
                fullWidth
              />
              <TextField
                label="var2"
                value={vars.var2}
                onChange={e => setVars({ ...vars, var2: e.target.value })}
                fullWidth
              />
              <TextField
                label="var3"
                value={vars.var3}
                onChange={e => setVars({ ...vars, var3: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="var4"
                value={vars.var4}
                onChange={e => setVars({ ...vars, var4: e.target.value })}
                fullWidth
              />
              <TextField
                label="var5"
                value={vars.var5}
                onChange={e => setVars({ ...vars, var5: e.target.value })}
                fullWidth
              />
            </Stack>
          </Stack>
        )}
        {tab === 1 && (
          <Stack spacing={2}>
            <Typography variant="body2">
              Sube un CSV con cabeceras: <b>name, phone</b> (opcional: var1..var5).
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadTemplate}>
                Descargar plantilla
              </Button>
              <Button component="label" variant="contained" startIcon={<UploadFileOutlinedIcon />}>
                Seleccionar CSV
                <input
                  type="file"
                  hidden
                  accept=".csv,text/csv"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) onCSV(f)
                  }}
                />
              </Button>
            </Stack>
          </Stack>
        )}
        {!!error && (
          <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        {tab === 0 && (
          <Button variant="contained" onClick={submitSingle}>
            ENVIAR
          </Button>
        )}
        <Button variant="outlined" onClick={onClose}>
          {tab === 0 ? "Cancelar" : "Cerrar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type EditContactDialogProps = {
  open: boolean
  contact?: Contact
  onClose: () => void
  onSave: (updatedContact: Contact) => void
}
const EditContactDialog: React.FC<EditContactDialogProps> = ({ open, contact, onClose, onSave }) => {
  const [formData, setFormData] = React.useState<Partial<Contact>>({})
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (contact) {
      setFormData(contact)
    } else {
      setFormData({})
    }
    setError(null)
  }, [contact, open])

  const handleChange = (field: keyof Omit<Contact, "id" | "date" | "agendaId">, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.contactName?.trim() || !formData.phone?.trim()) {
      setError("Nombre y número son obligatorios.")
      return
    }
    if (!formData.id || !formData.agendaId) {
      setError("Falta información del contacto.")
      return
    }
    onSave(formData as Contact)
  }

  if (!open) return null

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editar Contacto</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Nombre del contacto"
            value={formData.contactName || ""}
            onChange={e => handleChange("contactName", e.target.value)}
            fullWidth
          />
          <TextField
            label="Número telefónico (agregue el código de país)"
            value={formData.phone || ""}
            onChange={e => handleChange("phone", e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">+</InputAdornment> }}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="var1"
              value={formData.var1 || ""}
              onChange={e => handleChange("var1", e.target.value)}
              fullWidth
            />
            <TextField
              label="var2"
              value={formData.var2 || ""}
              onChange={e => handleChange("var2", e.target.value)}
              fullWidth
            />
            <TextField
              label="var3"
              value={formData.var3 || ""}
              onChange={e => handleChange("var3", e.target.value)}
              fullWidth
            />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="var4"
              value={formData.var4 || ""}
              onChange={e => handleChange("var4", e.target.value)}
              fullWidth
            />
            <TextField
              label="var5"
              value={formData.var5 || ""}
              onChange={e => handleChange("var5", e.target.value)}
              fullWidth
            />
          </Stack>
        </Stack>
        {!!error && (
          <Alert sx={{ mt: 2 }} severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          GUARDAR CAMBIOS
        </Button>
      </DialogActions>
    </Dialog>
  )
}


// =================================================================
// COMPONENTE PRINCIPAL: Phonebook
// =================================================================

const Phonebook: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newAgendaTitle, setNewAgendaTitle] = useState("")
  const [selectedAgenda, setSelectedAgenda] = useState<Agenda | undefined>(undefined)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Agenda | undefined>(undefined)
  const [renameValue, setRenameValue] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null)
  const [editingContact, setEditingContact] = useState<Contact | undefined>(undefined)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Lógica del Snackbar
  const [snack, setSnack] = useState<{ open: boolean; msg: string; sev: "success" | "error" }>({ open: false, msg: "", sev: 'success' });
  const showSuccess = useCallback((msg: string) => setSnack({ open: true, msg, sev: 'success' }), []);
  const showError = useCallback((msg: string) => setSnack({ open: true, msg, sev: 'error' }), []);

  // --- Lógica de Datos ---

const fetchContacts = useCallback(async (phonebookId: string) => {
  if (!phonebookId) {
    setContacts([]);
    return;
  }

  try {
    const response = await apiService.getContacts(phonebookId);

    const contactos = response?.data?.data || [];  

    const mapped = contactos.map((c: any) => ({
      id: String(c.id),
      agendaId: String(c.phonebook_id ?? phonebookId),
      contactName: c.name ?? "",
      phone: c.mobile ?? "",
      var1: c.var_one ?? "",
      var2: c.var_two ?? "",
      var3: c.var_three ?? "",
      var4: c.var_four ?? "",
      var5: c.var_five ?? "",
      date: c.createdAt,
    }));

    setContacts(mapped);

  } catch (error: any) {
    showError(`No se pudo cargar contactos: ${error.message}`);
  }
}, [showError]);


const fetchAgendas = useCallback(async (selectFirst = false) => {
  try {
    const response = await apiService.getPhonebooks();

    const agendasData = response.data?.data || [];

    const mappedAgendas: Agenda[] = agendasData.map((item: any) => ({
      id: String(item.phonebook_id),
      name: item.title ?? "",
      createdAt: item.createdAt,
      phonebook_id: String(item.phonebook_id),
      rawId: item.id,
      uid: item.uid,
    }));

    setAgendas(mappedAgendas);

    if (selectFirst && mappedAgendas.length > 0) {
      const firstAgenda = mappedAgendas[0];
      setSelectedAgenda(firstAgenda);
      await fetchContacts(firstAgenda.id);
    } else if (selectedAgenda) {
      const currentSelected = mappedAgendas.find(a => a.id === selectedAgenda.id);

      if (currentSelected) {
        setSelectedAgenda(currentSelected);
      } else if (mappedAgendas.length > 0) {
        setSelectedAgenda(mappedAgendas[0]);
        await fetchContacts(mappedAgendas[0].id);
      } else {
        setSelectedAgenda(undefined);
        setContacts([]);
      }
    }

  } catch (error: any) {
    showError(`No se pudo cargar agendas: ${error.message}`);
  }
}, [fetchContacts, showError, selectedAgenda]);


  useEffect(() => {
    fetchAgendas(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Lógica de Eventos y Acciones ---

  const addAgenda = useCallback(async () => {
    if (!newAgendaTitle.trim()) return;
    try {
      await apiService.addPhonebook(newAgendaTitle.trim());
      setNewAgendaTitle("");
      showSuccess("Agenda agregada.");
      await fetchAgendas(false);
    } catch (error: any) {
      showError(`Error al agregar agenda: ${error.message}`);
    }
  }, [newAgendaTitle, showSuccess, showError, fetchAgendas]);

  const handleSubmitManyContacts = useCallback(async (rows: Omit<Contact, "id" | "date">[]) => {
    const agendaId = rows[0]?.agendaId || selectedAgenda?.id;
    if (!agendaId || !selectedAgenda) {
      return showError("Seleccione una agenda antes de agregar contactos.");
    }
    try {
      for (const r of rows) {
        const payload = {
          phonebook_id: agendaId, phonebook_name: selectedAgenda.name,
          name: r.contactName, mobile: r.phone,
          var1: r.var1, var2: r.var2, var3: r.var3, var4: r.var4, var5: r.var5,
        };
        await apiService.addContact(payload);
      }
      showSuccess(`Se agregaron ${rows.length} contacto(s).`);
      await fetchContacts(agendaId);
    } catch (error: any) {
      showError(`Error al agregar contactos: ${error.message}`);
    }
  }, [selectedAgenda, showSuccess, showError, fetchContacts]);

  const handleUpdateContact = useCallback(async (updatedContact: Contact) => {
    try {
      const payload = {
        id: Number(updatedContact.id), name: updatedContact.contactName, mobile: updatedContact.phone,
        var_one: updatedContact.var1, var_two: updatedContact.var2, var_three: updatedContact.var3,
        var_four: updatedContact.var4, var_five: updatedContact.var5,
      };
      await apiService.updateContact(payload);
      setEditingContact(undefined);
      showSuccess("Contacto actualizado.");
      await fetchContacts(updatedContact.agendaId);
    } catch (error: any) {
      showError(`Error al actualizar contacto: ${error.message}`);
    }
  }, [showSuccess, showError, fetchContacts]);

  const applyRename = useCallback(async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      const payload = {
        id: renameTarget.rawId, uid: renameTarget.uid, title: renameTarget.name,
        phonebook_id: renameTarget.id, createdAt: renameTarget.createdAt,
        newTitle: renameValue.trim(),
      };
      await apiService.updatePhonebook(payload);
      setRenameTarget(undefined);
      showSuccess("Agenda renombrada.");
      await fetchAgendas(false);
    } catch (error: any) {
      showError(`Error al renombrar: ${error.message}`);
    }
  }, [renameTarget, renameValue, showSuccess, showError, fetchAgendas]);

  const removeAgenda = useCallback(async (agenda: Agenda) => {
    if (!window.confirm(`¿Eliminar la agenda "${agenda.name}"?`)) return;
    try {
      await apiService.deletePhonebook(agenda.rawId);
      showSuccess("Agenda eliminada.");
      await fetchAgendas(false);
    } catch (error: any) {
      showError(`Error al eliminar agenda: ${error.message}`);
    }
  }, [showSuccess, showError, fetchAgendas]);

  const deleteSingleContact = useCallback(async (contact: Contact) => {
    if (!window.confirm(`¿Eliminar el contacto ${contact.contactName}?`)) return;
    try {
      await apiService.deleteContacts([Number(contact.id)]);
      showSuccess("Contacto eliminado.");
      if (selectedAgenda) await fetchContacts(selectedAgenda.id);
    } catch (error: any) {
      showError(`Error al eliminar contacto: ${error.message}`);
    }
  }, [selectedAgenda, showSuccess, showError, fetchContacts]);

  const deleteSelectedContacts = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm("¿Eliminar los contactos seleccionados?")) return;
    try {
      const idsToDelete = Array.from(selectedIds).map(id => Number(id));
      await apiService.deleteContacts(idsToDelete);
      showSuccess("Contactos eliminados.");
      setSelectedIds(new Set());
      if (selectedAgenda) {
        await fetchContacts(selectedAgenda.id);
      }
    } catch (error: any) {
      showError(`Error al eliminar contactos: ${error.message}`);
    }
  }, [selectedIds, selectedAgenda, showSuccess, showError, fetchContacts]);

  const onSelectAgenda = useCallback(async (ag: Agenda) => {
    setSelectedAgenda(ag);
    await fetchContacts(ag.id);
    setSelectedIds(new Set());
  }, [fetchContacts]);

  const openAddContact = (agenda: Agenda) => {
    setSelectedAgenda(agenda)
    setOpenAddDialog(true)
  }

  const isSelected = (id: string) => selectedIds.has(id)
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  const paged = contacts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const allOnPageSelected = paged.length > 0 && paged.every(r => selectedIds.has(r.id))
  const someOnPageSelected = paged.some(r => selectedIds.has(r.id)) && !allOnPageSelected
  const toggleSelectAllOnPage = (checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      paged.forEach(r => {
        if (checked) next.add(r.id)
        else next.delete(r.id)
      })
      return next
    })
  }
//exportar csv
  const exportCSV = useCallback(() => {
    if (contacts.length === 0) {
        showError("No hay contactos para exportar.");
        return;
    }

    // 1. Definir los encabezados del CSV
    const headers = [
        "Nombre",
        "Agenda",
        "Móvil",
        "Variable 1",
        "Variable 2",
        "Variable 3",
        "Variable 4",
        "Variable 5",
        "Fecha de Creación"
    ];

    // Función para escapar comas y comillas en los datos
    const escapeCsvCell = (cell: any) => {
        const cellString = String(cell || "").trim();
        // Si el dato contiene comas, comillas dobles o saltos de línea, lo encerramos en comillas dobles
        if (cellString.includes(',') || cellString.includes('"') || cellString.includes('\n')) {
            // Reemplazar comillas dobles internas con dobles-comillas
            return `"${cellString.replace(/"/g, '""')}"`;
        }
        return cellString;
    };

    // 2. Mapear los datos de los contactos a filas de CSV
    const csvRows = contacts.map(contact => {
        const agendaName = agendas.find(a => a.id === contact.agendaId)?.name ?? "-";
        const row = [
            contact.contactName,
            agendaName,
            contact.phone,
            contact.var1,
            contact.var2,
            contact.var3,
            contact.var4,
            contact.var5,
            fmt(contact.date)
        ];
        return row.map(escapeCsvCell).join(',');
    });

    // 3. Unir encabezados y filas
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    
    // 4. Crear el Blob con BOM para compatibilidad con Excel (UTF-8)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 5. Crear y simular clic en el enlace de descarga
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "lista_de_contactos.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showSuccess("La exportación a CSV se ha completado.");

}, [contacts, agendas, showSuccess, showError]); // Dependencias para que la función se actualice si los datos cambian
  const printTable = useCallback(() => {
    if (contacts.length === 0) {
        showError("No hay datos en la tabla para imprimir.");
        return;
    }

    // 1. Obtener el HTML de la tabla
    const tableHtml = document.getElementById('contacts-table')?.outerHTML;
    if (!tableHtml) {
        showError("No se pudo encontrar la tabla para imprimir.");
        return;
    }

    // 2. Crear una nueva ventana para la impresión
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showError("No se pudo abrir la ventana de impresión. Revisa si tu navegador lo está bloqueando.");
        return;
    }

    // 3. Escribir el HTML y los estilos en la nueva ventana
    printWindow.document.write(`
        <html>
            <head>
                <title>Lista de Contactos</title>
                <style>
                    body { font-family: sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
                    th { background-color: #f2f2f2; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    /* Ocultar la columna de acciones en la impresión */
                    th:nth-child(2), td:nth-child(2) { display: none; }
                </style>
            </head>
            <body>
                <h1>Lista de Contactos</h1>
                ${tableHtml}
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus(); // Requerido por algunos navegadores

    // 4. Llamar al diálogo de impresión y cerrar la ventana
    setTimeout(() => { // Un pequeño retraso para asegurar que el contenido se renderice
        printWindow.print();
        printWindow.close();
    }, 250);

}, [contacts.length, showError]); // Dependencia para que la función sepa si hay contactos

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: 2,
        p: { xs: 1, sm: 2 },
        minHeight: "100vh",
        boxSizing: "border-box",
      }}
    >
      <Card sx={{ width: { xs: "100%", lg: 280 }, flexShrink: 0, p: 2 }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box
            component="img"
            src={phonebookImg}
            alt="Agenda telefónica"
            sx={{ width: "100%", maxWidth: "200px", height: "auto", borderRadius: 2, mb: 2 }}
          />
          <Typography variant="h6" align="center">
            Agenda telefónica
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2, fontWeight: "bold", textTransform: "none" }}
          >
            Administrar agenda telefónica
          </Button>
        </CardContent>
      </Card>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Agregar agenda telefónica
            </Typography>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
              <TextField
                label="Ingrese título de la agenda telefónica"
                value={newAgendaTitle}
                onChange={e => setNewAgendaTitle(e.target.value)}
                fullWidth
                onKeyDown={e => { if (e.key === 'Enter') addAgenda() }}
              />
              <Button variant="contained" color="primary" onClick={addAgenda}>
                Agregar
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Lista de agendas telefónicas
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
              {agendas.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Aún no hay agendas.
                </Typography>
              )}
              {agendas.map(ag => (
                <Box
                  key={ag.id}
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: 999,
                    px: 1,
                    py: 0.5,
                    border: theme => `1px solid ${theme.palette.divider}`,
                    gap: 0.5,
                  }}
                >
                  <Chip
                    label={ag.name}
                    variant={selectedAgenda?.id === ag.id ? "filled" : "outlined"}
                    color={selectedAgenda?.id === ag.id ? "primary" : "default"}
                    onClick={() => onSelectAgenda(ag)}
                    sx={{ border: 0, "& .MuiChip-label": { px: 1 } }}
                  />
                  <IconButton size="small" onClick={() => openAddContact(ag)} title="Agregar número">
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => { setRenameTarget(ag); setRenameValue(ag.name) }} title="Editar nombre">
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => removeAgenda(ag)} title="Eliminar agenda">
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Toolbar sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Typography variant="subtitle1">
              Lista de contactos {selectedIds.size > 0 ? `(${selectedIds.size} seleccionados)` : ""}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button
                startIcon={<DownloadIcon />}
                onClick={e => setExportAnchor(e.currentTarget)}
                variant="outlined"
              >
                EXPORTAR
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                color="error"
                variant="outlined"
                disabled={selectedIds.size === 0}
                onClick={deleteSelectedContacts}
              >
                Eliminar
              </Button>
              <Menu
                open={Boolean(exportAnchor)}
                anchorEl={exportAnchor}
                onClose={() => setExportAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setExportAnchor(null)
                    exportCSV()
                  }}
                >
                  Descargar CSV
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setExportAnchor(null)
                    printTable()
                  }}
                >
                  Imprimir
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
          <Divider />

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <TableContainer component={Paper} sx={{ flex: 1 }}>
              <Table id="contacts-table" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allOnPageSelected}
                        indeterminate={someOnPageSelected}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          toggleSelectAllOnPage(e.target.checked)
                        }
                      />
                    </TableCell>
                    <TableCell>Acciones</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Agenda</TableCell>
                    <TableCell>Móvil</TableCell>
                    <TableCell>var1</TableCell>
                    <TableCell>var2</TableCell>
                    <TableCell>var3</TableCell>
                    <TableCell>var4</TableCell>
                    <TableCell>var5</TableCell>
                    <TableCell>Fecha</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        No hay contactos para mostrar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paged.map(row => {
                      const agendaName = agendas.find(a => a.id === row.agendaId)?.name ?? "-"
                      const checked = isSelected(row.id)
                      return (
                        <TableRow key={row.id} hover>
                          <TableCell padding="checkbox">
                            <Checkbox checked={checked} onChange={() => toggleSelect(row.id)} />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <IconButton size="small" title="Editar" onClick={() => setEditingContact(row)}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                title="Eliminar"
                                onClick={() => deleteSingleContact(row)}
                              >
                                <CloseOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                          <TableCell>{row.contactName}</TableCell>
                          <TableCell>{agendaName}</TableCell>
                          <TableCell>+{row.phone}</TableCell>
                          <TableCell>{row.var1}</TableCell>
                          <TableCell>{row.var2}</TableCell>
                          <TableCell>{row.var3}</TableCell>
                          <TableCell>{row.var4}</TableCell>
                          <TableCell>{row.var5}</TableCell>
                          <TableCell>{fmt(row.date)}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={contacts.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
              labelRowsPerPage="Filas por página:"
            />
          </Box>
        </Card>
      </Box>

      {/* Dialogos */}
      <AddContactDialog
        open={openAddDialog}
        agenda={selectedAgenda}
        onClose={() => setOpenAddDialog(false)}
        onSubmitMany={handleSubmitManyContacts}
      />

      <EditContactDialog
        open={!!editingContact}
        contact={editingContact}
        onClose={() => setEditingContact(undefined)}
        onSave={handleUpdateContact}
      />

      <Dialog open={!!renameTarget} onClose={() => setRenameTarget(undefined)}>
        <DialogTitle>Renombrar agenda</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            label="Nuevo nombre"
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameTarget(undefined)}>Cancelar</Button>
          <Button variant="contained" onClick={applyRename}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Phonebook;
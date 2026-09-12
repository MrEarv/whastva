import * as React from 'react'
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'

type User = { id: number; name: string; email: string }

const seed: User[] = [
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
  { id: 2, name: 'María García', email: 'maria@example.com' },
  { id: 3, name: 'Luis López', email: 'luis@example.com' }
]

export default function Users() {
  const [rows, setRows] = React.useState<User[]>(seed)
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<User | null>(null)
  const [form, setForm] = React.useState({ name: '', email: '' })
  const [confirmId, setConfirmId] = React.useState<number | null>(null)

  const onOpenNew = () => { setEditing(null); setForm({ name: '', email: '' }); setOpen(true) }
  const onOpenEdit = (u: User) => { setEditing(u); setForm({ name: u.name, email: u.email }); setOpen(true) }
  const onClose = () => setOpen(false)

  const onSave = () => {
    if (!form.name.trim() || !form.email.trim()) return
    if (editing) {
      setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...form } as User : r))
    } else {
      const id = Math.max(0, ...rows.map(r => r.id)) + 1
      setRows(prev => [...prev, { id, ...form } as User])
    }
    setOpen(false)
  }

  const onConfirmDelete = () => {
    if (confirmId == null) return
    setRows(prev => prev.filter(r => r.id !== confirmId))
    setConfirmId(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Usuarios</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={onOpenNew}>Agregar</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Editar">
                    <IconButton onClick={() => onOpenEdit(row)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => setConfirmId(row.id)}><DeleteIcon /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogo Crear/Editar */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
          <TextField
            autoFocus
            label="Nombre"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ej. Juan Pérez"
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="correo@dominio.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={onSave}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmación de eliminación */}
      <Dialog open={confirmId != null} onClose={() => setConfirmId(null)}>
        <DialogTitle>¿Eliminar este usuario?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmId(null)}>No</Button>
          <Button color="error" variant="contained" onClick={onConfirmDelete}>Sí, eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
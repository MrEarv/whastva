import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, TextField, Typography, CircularProgress } from '@mui/material';


const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
};

interface ImagePreviewModalProps {
    open: boolean;
    imageFile: File | null;
    onClose: () => void;
    onSend: (file: File, caption: string) => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ open, imageFile, onClose, onSend }) => {
    const [caption, setCaption] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    const handleSend = async () => {
        if (imageFile && !isSending) {
            setIsSending(true);
            await onSend(imageFile, caption);
            setIsSending(false);
            setCaption('');
            onClose();
        }
    };

    const handleClose = () => {
        if (!isSending) {
            setCaption('');
            onClose();
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); 
            handleSend();
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2">Enviar Imagen</Typography>
                
                {previewUrl && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <img 
                            src={previewUrl} 
                            alt="Previsualización" 
                            style={{ maxHeight: '300px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                        />
                    </Box>
                )}
                
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Añadir un comentario... (opcional)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    disabled={isSending}
                    multiline
                    rows={2}
                    onKeyDown={handleKeyDown} 
                />
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="text" onClick={handleClose} disabled={isSending}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleSend}
                        disabled={!imageFile || isSending}
                        startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {isSending ? 'Enviando...' : 'Enviar'}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ImagePreviewModal;
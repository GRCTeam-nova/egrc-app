
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const UploadFileModal = ({ open, handleClose, handleUpload }) => {
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const onFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onFileNameChange = (event) => {
    setFileName(event.target.value);
  };

  const onSubmit = () => {
    if (fileName && selectedFile) {
      handleUpload(fileName, selectedFile);
      setFileName('');
      setSelectedFile(null);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Upload de Novo Arquivo</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Nome do Documento"
          type="text"
          fullWidth
          value={fileName}
          onChange={onFileNameChange}
        />
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
          <input
            accept="*/*"
            style={{ display: 'none' }}
            id="raised-button-file"
            multiple
            type="file"
            onChange={onFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
              {selectedFile ? selectedFile.name : 'Escolher Arquivo'}
            </Button>
          </label>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={onSubmit} color="primary" disabled={!fileName || !selectedFile}>
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadFileModal;


import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Autocomplete,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Exemplo de dados para autocomplete
const tiposDocumento = [
  { label: 'Contrato', id: 1 },
  { label: 'Nota Fiscal', id: 2 },
];

const tags = [
  { label: 'Importante', id: 1 },
  { label: 'Urgente', id: 2 },
];

const ModalAdicionarDocumentos = ({ open, handleClose }) => {
  const [documentos, setDocumentos] = useState([]);
  const [nomeDocumento, setNomeDocumento] = useState('');

  const handleAdicionarDocumento = () => {
    if (nomeDocumento) {
      setDocumentos((prev) => [
        ...prev,
        { nome: nomeDocumento, tipoDocumento: null, descricao: '', tags: [] },
      ]);
      setNomeDocumento('');
    }
  };

  const handleRemoverDocumento = (index) => {
    setDocumentos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChangeDocumento = (index, campo, valor) => {
    setDocumentos((prev) =>
      prev.map((doc, i) => (i === index ? { ...doc, [campo]: valor } : doc))
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>Adicionar Documentos</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nome do Documento"
              value={nomeDocumento}
              onChange={(e) => setNomeDocumento(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              color="primary"
              onClick={handleAdicionarDocumento}
            >
              Adicionar Documento
            </Button>
          </Grid>

          {/* Tabela de documentos */}
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo Documento</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Tags</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentos.map((doc, index) => (
                    <TableRow key={index}>
                      <TableCell>{doc.nome}</TableCell>
                      <TableCell>
                        <Autocomplete
                          options={tiposDocumento}
                          getOptionLabel={(option) => option.label}
                          value={doc.tipoDocumento}
                          onChange={(e, value) =>
                            handleChangeDocumento(index, 'tipoDocumento', value)
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Tipo Documento" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          value={doc.descricao}
                          onChange={(e) =>
                            handleChangeDocumento(index, 'descricao', e.target.value)
                          }
                          label="Descrição"
                        />
                      </TableCell>
                      <TableCell>
                        <Autocomplete
                          multiple
                          options={tags}
                          getOptionLabel={(option) => option.label}
                          value={doc.tags}
                          onChange={(e, value) =>
                            handleChangeDocumento(index, 'tags', value)
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Tags" />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="secondary"
                          onClick={() => handleRemoverDocumento(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalAdicionarDocumentos;

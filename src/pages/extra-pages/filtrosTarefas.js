import React, { useState, useEffect } from 'react';
import {
  Drawer, Button, TextField, Divider, FormControl, Box, IconButton, Stack, InputLabel, MenuItem, Select, Grid, Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';

import Autocomplete from '@mui/material/Autocomplete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';

const FiltrosTarefas = ({ open, onClose, onFilter, initialFilters, origemOptions, tipoAndamentoOptions }) => {
  const [origem, setOrigem] = useState([]);
  const [tipoAndamento, setTipoAndamento] = useState([]);
  const [marco, setMarco] = useState('');
  const [dtInicioDataAndamento, setDtInicioDataAndamento] = useState(null);
  const [dtFimDataAndamento, setDtFimDataAndamento] = useState(null);
  const [dtInicioPrazo, setDtInicioPrazo] = useState(null);
  const [dtFimPrazo, setDtFimPrazo] = useState(null);
  const [teor, setTeor] = useState('');

  useEffect(() => {
    if (open && initialFilters) {
      setOrigem(initialFilters.origem);
      setTipoAndamento(initialFilters.tipoAndamento);
      setMarco(initialFilters.marco);
      setDtInicioDataAndamento(initialFilters.dtInicioDataAndamento);
      setDtFimDataAndamento(initialFilters.dtFimDataAndamento);
      setDtInicioPrazo(initialFilters.dtInicioPrazo);
      setDtFimPrazo(initialFilters.dtFimPrazo);
      setTeor(initialFilters.teor);
    }
  }, [open, initialFilters]);

  const handleFilter = () => {
    onFilter({
      origem,
      tipoAndamento,
      marco,
      dtInicioDataAndamento,
      dtFimDataAndamento,
      dtInicioPrazo,
      dtFimPrazo,
      teor
    });
  };

  const renderOption = (props, option, { selected }) => (
    <li {...props}>
      <Checkbox
        checked={selected}
        sx={{ mr: 1 }}
      />
      {option.label}
    </li>
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
        <Box sx={{ width: 650, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Box component="h2" sx={{ color: '#1C5297', fontWeight: 600, fontSize: '16px' }}>Filtros</Box>
            <IconButton onClick={onClose}>
              <CloseIcon sx={{ color: '#1C5297', fontSize: '18px' }} />
            </IconButton>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Tipo de tarefa</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={origemOptions}
                  value={origem}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => setOrigem(newValue)}
                  renderOption={renderOption}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Responsável</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={tipoAndamentoOptions}
                  value={tipoAndamento}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => setTipoAndamento(newValue)}
                  renderOption={renderOption}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
          </Grid>
          
          <Grid container spacing={2} marginTop={1} marginBottom={1.5}>
            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Prazo Judicial - Início</InputLabel>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  value={dtInicioPrazo}
                  onChange={(newValue) => setDtInicioPrazo(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Prazo Judicial - Fim</InputLabel>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  value={dtFimPrazo}
                  onChange={(newValue) => setDtFimPrazo(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
          </Grid>
          <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Teor</InputLabel>
          <FormControl fullWidth margin="normal">
            <TextField
              value={teor}
              multiline
              rows={4}
              onChange={(e) => setTeor(e.target.value)}
            />
          </FormControl>

          <Divider style={{ width: '99%', height: '1.5px', backgroundColor: '#00000040', marginTop: 80 }} />

          <Box mt={3} display="flex" justifyContent="center" mb={5} sx={{ marginTop: 5 }}>
            <Button variant="outlined" onClick={onClose} sx={{ width: '113px', marginRight: 1 }}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleFilter} sx={{ width: '113px' }}>
              Filtrar
            </Button>
          </Box>
        </Box>
      </LocalizationProvider>
    </Drawer>
  );
};

export default FiltrosTarefas;

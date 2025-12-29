import React, { useState, useEffect } from 'react';
import {
  Drawer, Button, TextField, Divider, FormControl, Box, IconButton, Stack, InputLabel, MenuItem, Select, Grid, Checkbox
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from '@mui/material/Autocomplete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';

const FiltrosAndamentosMenu = ({ open, onClose, onFilter, initialFilters, ufOptions, orgaoOptions, clienteOptions, areaOptions, segmentoOptions, statusOptions, faseOptions }) => {
  const [uf, setUf] = useState([]);
  const [orgao, setOrgao] = useState([]);
  const [cliente, setCliente] = useState([]);
  const [area, setArea] = useState([]);
  const [segmento, setSegmento] = useState([]);
  const [status, setStatus] = useState([]);
  const [fase, setFases] = useState([]);
  const [marco, setMarco] = useState('');
  const [dtInicioDataDistribuicao, setDtInicioDataDistribuicao] = useState(null);
  const [dtFimDataDistribuicao, setDtFimDataDistribuicao] = useState(null);
  const [dtInicioPrazo, setDtInicioPrazo] = useState(null);
  const [dtFimPrazo, setDtFimPrazo] = useState(null);
  const [teor, setTeor] = useState('');

  useEffect(() => {
    if (open && initialFilters) {
      setUf(initialFilters.uf);
      setOrgao(initialFilters.orgao);
      setArea(initialFilters.area);
      setSegmento(initialFilters.segmento);
      setStatus(initialFilters.status);
      setFases(initialFilters.fase);
      setCliente(initialFilters.clientes);
      setMarco(initialFilters.marco);
      setDtInicioDataDistribuicao(initialFilters.dtInicioDataDistribuicao);
      setDtFimDataDistribuicao(initialFilters.dtFimDataDistribuicao);
      setDtInicioPrazo(initialFilters.dtInicioPrazo);
      setDtFimPrazo(initialFilters.dtFimPrazo);
      setTeor(initialFilters.teor);
    }
  }, [open, initialFilters]);

  const handleFilter = () => {
    onFilter({
      uf,
      orgao,
      cliente,
      area,
      segmento,
      fase,
      status,
      marco,
      dtInicioDataDistribuicao,
      dtFimDataDistribuicao,
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
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Uf</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={ufOptions}
                  value={uf}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => setUf(newValue)}
                  renderOption={renderOption}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Orgão</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={orgaoOptions}
                  value={orgao}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => setOrgao(newValue)}
                  renderOption={renderOption}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Empresa</InputLabel>
              <FormControl fullWidth margin="normal">
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={clienteOptions}
                  value={cliente}
                  getOptionLabel={(option) => option.label}
                  onChange={(event, newValue) => setCliente(newValue)}
                  renderOption={renderOption}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Marco</InputLabel>
              <FormControl fullWidth margin="normal">
                <Select
                  value={marco}
                  onChange={(e) => setMarco(e.target.value)}
                >
                  <MenuItem value="">Selecione uma opção</MenuItem>
                  <MenuItem value="true">Sim</MenuItem>
                  <MenuItem value="false">Não</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2} marginTop={1}>
            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Data de Distribuição - Início</InputLabel>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  value={dtInicioDataDistribuicao}
                  onChange={(newValue) => setDtInicioDataDistribuicao(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Data de Distribuição - Fim</InputLabel>
              <FormControl fullWidth margin="normal">
                <DatePicker
                  value={dtFimDataDistribuicao}
                  onChange={(newValue) => setDtFimDataDistribuicao(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Área</InputLabel>
            <FormControl fullWidth margin="normal">
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={areaOptions}
                value={area}
                getOptionLabel={(option) => option.label}
                onChange={(event, newValue) => setArea(newValue)}
                renderOption={renderOption}
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Segmento</InputLabel>
            <FormControl fullWidth margin="normal">
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={segmentoOptions}
                value={segmento}
                getOptionLabel={(option) => option.label}
                onChange={(event, newValue) => setSegmento(newValue)}
                renderOption={renderOption}
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Status</InputLabel>
            <FormControl fullWidth margin="normal">
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={statusOptions}
                value={status}
                getOptionLabel={(option) => option.label}
                onChange={(event, newValue) => setStatus(newValue)}
                renderOption={renderOption}
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <InputLabel sx={{ fontSize: '12px', fontWeight: 600 }}>Fase</InputLabel>
            <FormControl fullWidth margin="normal">
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={faseOptions}
                value={fase}
                getOptionLabel={(option) => option.label}
                onChange={(event, newValue) => setFases(newValue)}
                renderOption={renderOption}
                renderInput={(params) => <TextField {...params} />}
              />
            </FormControl>
          </Grid>

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

export default FiltrosAndamentosMenu;

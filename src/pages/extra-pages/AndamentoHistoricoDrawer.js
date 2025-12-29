import React, { useRef, useEffect, useState } from 'react';
import { API_QUERY, API_COMMAND } from '../../config';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import MainCard from '../../components/MainCard';
import Divider from '@mui/material/Divider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import { faClockRotateLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import SimpleBar from '../../components/third-party/SimpleBar';

const AndamentoHistoricoDrawer = ({ open, onClose, row, vindoDe }) => {
    const simpleBarRef = useRef(null);
    const avatarSrc = 'path/to/avatar.jpg';
    const [historicoData, setHistoricoData] = useState([]);

    useEffect(() => {
        const fetchHistorico = async () => {
            try {
                const endpoint = vindoDe === 'Tipo de Andamentos'
                    ? `${API_QUERY}/api/Log/GetTipoAndamento/${row.id}`
                    : `${API_QUERY}/api/Log/GetAndamento/${row.id}`;

                const response = await fetch(endpoint);
                const data = await response.json();

                const isDate = (value) => {
                    return !isNaN(Date.parse(value));
                };

                if (data && Array.isArray(data)) {
                    // Transformar os dados do endpoint no formato desejado
                    const transformedData = data.map(item => {
                        let valorAntigo = item.valorAntigo;
                        let valorNovo = item.valorNovo;

                        if (isDate(item.valorAntigo)) {
                            valorAntigo = new Date(item.valorAntigo).toLocaleDateString('pt-BR');
                        }
                        if (isDate(item.valorNovo)) {
                            valorNovo = new Date(item.valorNovo).toLocaleDateString('pt-BR');
                        }

                        if (item.acao === 'Insert') {
                            return {
                                acao: vindoDe === 'Tipo de Andamentos' ? 'criou esse tipo de andamento' : 'criou esse andamento',
                                data: new Date(item.dtAcao).toLocaleDateString('pt-BR'),
                                border: '',
                                dividerHeight: '30px'
                            };
                        } else {
                            return {
                                acao: (
                                    <>
                                        editou <span style={{ fontWeight: 600 }}>{item.atributo}</span>
                                    </>
                                ),
                                
                                data: new Date(item.dtAcao).toLocaleDateString('pt-BR'),
                                detalhe: `${valorAntigo} > ${valorNovo}`,
                                border: '',
                                detalheNovoColor: '#1C5297',
                                dividerHeight: '50px'
                            };
                        }
                    });

                    setHistoricoData(transformedData);
                } else {
                    setHistoricoData([]);
                }
            } catch (error) {
                setHistoricoData([]);
            }
        };

        if (open) {
            fetchHistorico();
        }
    }, [open, row.id, vindoDe]);

    useEffect(() => {
        if (open && simpleBarRef.current) {
            simpleBarRef.current.recalculate();
        }
    }, [open]);

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 501 } }}>
            <MainCard
                title={
                    <>
                        <FontAwesomeIcon icon={faClockRotateLeft} style={{ marginRight: 8 }} /> Histórico
                    </>
                }
                sx={{
                    border: 'none',

                    borderRadius: 0,
                    height: '100vh',
                    '& .MuiCardHeader-root': {
                        color: '#1C5297',
                        '& .MuiTypography-root': { fontSize: '16px', fontWeight: 400 }
                    }
                }}
                secondary={
                    <IconButton shape="rounded" onClick={onClose} size="small" sx={{ color: 'background.paper' }}>
                        <FontAwesomeIcon icon={faXmark} style={{ color: '#1C5297', fontSize: '16px', fontWeight: 900 }} />
                    </IconButton>
                }
            >
                <SimpleBar ref={simpleBarRef} style={{ maxHeight: 'calc(100vh - 124px)', paddingRight: '18px' }}>
                    <Box padding={0}>
                        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography
                                variant="h6"
                                component="h2"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    lineHeight: '21.79px',
                                    textAlign: 'left',
                                    color: '#1C5297',
                                    marginBottom: '10px'
                                }}
                            >
                                Histórico
                            </Typography>
                        </Grid>

                        {/* Conteúdo do histórico */}
                        <Box mt={2}>
                            {historicoData.map((item, index) => (
                                <Box key={index} style={{ border: item.border, padding: '10px', borderRadius: '4px' }}>
                                    <Grid container spacing={2} style={{marginLeft: -25}}>
                                        <Grid item xs={2}>
                                            <Avatar src={avatarSrc} alt="Walter Augusto" />
                                            {index !== historicoData.length - 1 && (
                                                <Box display="flex" justifyContent="center" mt={1} height="100%">
                                                    <Divider orientation="vertical" flexItem
                                                        style={{
                                                            border: '0.6px solid #00000033',
                                                            height: item.dividerHeight,
                                                            marginLeft: '-15px'
                                                        }} />
                                                </Box>
                                            )}
                                        </Grid>
                                        <Grid item xs={10} sx={{ marginTop: 1 }}>
                                            <Typography variant="body2" style={{ fontWeight: 600 }}>
                                                Walter Augusto <span style={{ fontWeight: 400 }}>{item.acao}</span>
                                            </Typography>
                                            <Typography variant="body2" style={{ color: '#717171CC', display: 'flex', alignItems: 'center' }}>
                                                <FontAwesomeIcon icon={faClock} style={{ marginRight: 4 }} /> {item.data}
                                            </Typography>
                                            {item.detalhe && (
                                                <Box p={1} borderRadius={2} mt={1} sx={{ border: '0.6px dotted #00000040' }}>
                                                    <Typography variant="body2" style={{ fontWeight: 400 }}>
                                                        <span>{item.detalhe.split(' > ')[0]}</span>
                                                        {' > '}
                                                        <span style={{ color: item.detalheNovoColor }}>{item.detalhe.split(' > ')[1]}</span>
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </SimpleBar>
            </MainCard>
        </Drawer>
    );
};


export default AndamentoHistoricoDrawer;

import React from 'react';
import { Stepper, Box, Step, StepLabel, StepConnector, styled, Typography, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEye, faCircle } from '@fortawesome/free-regular-svg-icons';
import { IconButton } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import eventEmitter from './eventEmitter';

const greenColor = '#4ECC8F';

const formatDate = (dateStr) => {
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const [day, month, year] = dateStr.split('/');

  return {
    fullDate: `${day} de ${months[parseInt(month) - 1]} de ${year}`,
    dateISO: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  };
};



const GreenConnector = styled(StepConnector)({
  '&.MuiStepConnector-line': {
    borderTopWidth: '0.6px',
    borderTopStyle: 'solid',
    borderTopColor: greenColor,
  },
});

function GreenStepIcon(props) {
  const { completed } = props;

  return (
    <Grid container justifyContent="flex-start">
      <Grid item>
        {completed ? (
          <FontAwesomeIcon icon={faCircle} style={{
            color: '#1C5297',
            fontSize: '14px',
            marginTop: '5px'
          }} />

        ) : (
          <CheckCircleIcon sx={{ color: greenColor, fontSize: '14px', marginTop: 0.6 }} />
        )}
      </Grid>
    </Grid>
  );
}


function CustomizedSteppers({ andamentosTimeline }) {

  const [activeStep] = React.useState(0);
  const [orderDirection, setOrderDirection] = React.useState('none');
  const [sortedSteps, setSortedSteps] = React.useState([]);
  const [originalSteps, setOriginalSteps] = React.useState([]); // Estado para preservar a ordem original

  // Conversão e preparação inicial dos dados
  React.useEffect(() => {
    const formattedSteps = andamentosTimeline.map(item => {
      const { fullDate, dateISO } = formatDate(item.dataCriacao);
      return {
        id: item.id, // Adicione o ID aqui
        label: item.nomeTipoAndamento,
        date: fullDate,
        dateISO: dateISO
      };
    });
    setSortedSteps(formattedSteps);
    setOriginalSteps(formattedSteps); // Armazenando a ordem original
  }, [andamentosTimeline]);

  const handleOrderClick = () => {
    const newDirection = orderDirection === 'asc' ? 'desc' : orderDirection === 'desc' ? 'none' : 'asc';
    setOrderDirection(newDirection);

    // Processar a ordenação imediatamente após a definição da direção
    let newSortedSteps;
    if (newDirection === 'asc') {
      newSortedSteps = [...sortedSteps].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
    } else if (newDirection === 'desc') {
      newSortedSteps = [...sortedSteps].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    } else {
      // Se a direção for 'none', restaura a ordem original
      newSortedSteps = [...originalSteps];
    }

    setSortedSteps(newSortedSteps);
  };

  const handleViewDetailsClick = (id) => {
    eventEmitter.emit('andamentoIdDetalhes', id, true);
  };

  const minWidth = 1000 + Math.max(0, (sortedSteps.length - 5) * 350);

  return (
    <Box
      mt={3}
      backgroundColor="#F5F5F5"
      sx={{
        width: '100%',
        overflowX: 'hidden', // Esconde a barra de rolagem inicialmente
        paddingTop: '20px',
        paddingBottom: '10px',
        transition: 'overflow-x 0.3s ease',
        '&:hover': {
          overflowX: 'auto'
        },
        '&::-webkit-scrollbar': {
          height: '3.5px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)', // Cor da barra de rolagem
          borderRadius: '4px', // Borda arredondada da barra de rolagem
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.1)', // Cor da trilha da barra de rolagem
          borderRadius: '4px', // Borda arredondada da trilha
        }

      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 3, marginBottom: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#1C447C', fontWeight: 600, fontSize: '16px' }}>
          Linha do Tempo
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1, marginTop: -1.5 }}>
          <IconButton
            onClick={handleOrderClick}
            size="small"
            sx={{
              mb: -1.4,
              opacity: (orderDirection === 'asc' || orderDirection === 'none') ? 1 : 0.5,
              '&:hover': { backgroundColor: 'transparent' },
              padding: 0
            }}
          >
            <ArrowDropUpIcon sx={{ color: '#1C447C' }} />
          </IconButton>

          <IconButton
            onClick={handleOrderClick}
            size="small"
            sx={{
              mt: -1.4,
              opacity: (orderDirection === 'desc' || orderDirection === 'none') ? 1 : 0.5,
              '&:hover': { backgroundColor: 'transparent' },
              padding: 0
            }}
          >
            <ArrowDropDownIcon sx={{ color: '#1C447C' }} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ minWidth: minWidth, marginBottom: 3 }}>
        <Stepper alternativeLabel activeStep={activeStep} connector={<GreenConnector />}>
          {sortedSteps.map((step, index) => (
            <Step key={index}>
              <StepLabel StepIconComponent={GreenStepIcon}>
                <Typography variant="caption" display="block" gutterBottom sx={{ textAlign: 'center', color: index === sortedSteps.length - 100 ? '#1C5297' : '#4ECC8F', fontWeight: 600, fontSize: '14px', marginTop: -1 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom sx={{ textAlign: 'center', color: index === sortedSteps.length - 100 ? '#1C5297' : '#717171CC', fontSize: '12px', fontWeight: index === sortedSteps.length - 100 ? 600 : 400 }}>
                  <FontAwesomeIcon icon={faClock} style={{ color: index === sortedSteps.length - 100 ? '#1C5297' : '#00000099', marginRight: '3px' }} /> {step.date}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  gutterBottom
                  sx={{ textAlign: 'center', color: '#717171CC', fontSize: '12px', fontWeight: 400, cursor: 'pointer' }} // Adicionei cursor aqui
                  onClick={() => handleViewDetailsClick(step.id)}
                >
                  <FontAwesomeIcon icon={faEye} style={{ color: '#00000099', marginRight: '3px', cursor: 'pointer' }} /> Ver Detalhes
                </Typography>

              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Box>
  );
}

export default CustomizedSteppers;
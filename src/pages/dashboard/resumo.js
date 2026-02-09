import { useState } from "react";

// material-ui
import { Box, Tabs, Tab, Grid, Stack, Typography, Button } from "@mui/material";

// project import
import MainCard from "../../components/MainCard";
import IncomeAreaChart from "../../sections/dashboard/default/IncomeAreaChart";
import MonthlyBarChart from "../../sections/dashboard/default/MonthlyBarChart";
import GovernanceOrgChart from "../../sections/dashboard/default/GovernanceOrgChart";
import DepartmentOrgChart from "../../sections/dashboard/default/DepartmentOrgChart";
import ProcessDashboard from "../../sections/dashboard/default/ProcessDashboard";
import DataDashboard from "../../sections/dashboard/default/DataDashboard";
import AccountsDashboard from "../../sections/dashboard/default/AccountsChart";
import RiskDashboard from "../../sections/dashboard/default/RisksCharts";
import ActiveDashboard from "../../sections/dashboard/default/ActivesCharts";
import ControlDashboard from "../../sections/dashboard/default/ControlDashboard";

// ==============================|| DASHBOARD COM TABS ||============================== //

export default function DashboardWithTabs() {
  // tab selection state
  const [currentTab, setCurrentTab] = useState("dados");
  // slot state for the area chart
  const [slot, setSlot] = useState("week");

  const handleTabChange = (event, newTab) => {
    setCurrentTab(newTab);
  };

  return (
    <Box>
      {/* Tabs no header */}
      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label="Dashboard Tabs"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Empresas" value="empresas" />
        <Tab label="Departamento" value="departamento" />
        <Tab label="Processo" value="processo" />
        <Tab label="Dados" value="dados" />
        <Tab label="Contas" value="contas" />
        <Tab label="Ativos" value="ativos" />
        <Tab label="Riscos" value="riscos" />
        <Tab label="Controle" value="controle" />
      </Tabs>

      {/* Aba Empresas */}
      {currentTab === 'empresas' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Estrutura de Governança</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de governança */}
                <GovernanceOrgChart />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}

      {/* Aba Departamento */}
      {currentTab === 'departamento' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Organograma de Departamentos</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de departamento */}
                <DepartmentOrgChart />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}
      
      {currentTab === 'processo' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Processo</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de departamento */}
                <ProcessDashboard />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}
      
      {currentTab === 'dados' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Dados</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de departamento */}
                <DataDashboard />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}

      {currentTab === 'contas' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Contas</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de departamento */}
                <AccountsDashboard />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}
      
      {currentTab === 'ativos' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Ativos</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de departamento */}
                <ActiveDashboard />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}
      
      {currentTab === 'riscos' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Riscos</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de departamento */}
                <RiskDashboard />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}
      
      {currentTab === 'controle' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12}>
            <Typography variant="h5">Controle</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ p: 2 }}>
                {/* Componente de organograma de departamento */}
                <ControlDashboard />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}

      {/* Conteúdo condicional por aba */}
      {currentTab === 'incidentes' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12} md={7} lg={8}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h5">Incidentes e Riscos</Typography>
              </Grid>
              <Grid item>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Button
                    size="small"
                    onClick={() => setSlot("month")}
                    color={slot === "month" ? "primary" : "secondary"}
                    variant={slot === "month" ? "outlined" : "text"}
                  >
                    Mês
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setSlot("week")}
                    color={slot === "week" ? "primary" : "secondary"}
                    variant={slot === "week" ? "outlined" : "text"}
                  >
                    Semana
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <MainCard content={false} sx={{ mt: 1.5 }}>
              <Box sx={{ pt: 1, pr: 2 }}>
                <IncomeAreaChart slot={slot} />
              </Box>
            </MainCard>
          </Grid>
          <Grid item xs={12} md={5} lg={4}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h5">Resumo semanal</Typography>
              </Grid>
            </Grid>
            <MainCard sx={{ mt: 2 }} content={false}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" color="textSecondary">
                    Resumo da semana
                  </Typography>
                  <Typography variant="h3">28</Typography>
                </Stack>
              </Box>
              <MonthlyBarChart />
            </MainCard>
          </Grid>
        </Grid>
      )}

      {currentTab === 'resumo' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12} md={5} lg={4}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid item>
                <Typography variant="h5">Resumo semanal</Typography>
              </Grid>
            </Grid>
            <MainCard sx={{ mt: 2 }} content={false}>
              <Box sx={{ p: 3, pb: 0 }}>
                <Stack spacing={2}>
                  <Typography variant="h6" color="textSecondary">
                    Resumo da semana
                  </Typography>
                  <Typography variant="h3">28</Typography>
                </Stack>
              </Box>
              <MonthlyBarChart />
            </MainCard>
          </Grid>
        </Grid>
      )}

      {currentTab === 'outro' && (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12} md={7} lg={8}>
            <Typography variant="h5">Outro Gráfico</Typography>
            <MainCard sx={{ mt: 1.5 }} content={false}>
              <Box sx={{ pt: 1, pr: 2 }}>
                {/* Pode reutilizar componentes atuais ou importar novos */}
                <IncomeAreaChart slot={slot} />
              </Box>
            </MainCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}


import { Grid, Typography, Divider, Button, Hidden } from '@mui/material';
import AnalyticEcommerce from '../../components/cards/statistics/AnalyticEcommerce';
import BalanceIcon from '@mui/icons-material/Balance';
import WindowIcon from '@mui/icons-material/Window';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useState, useEffect } from 'react';
import Logo2 from '../../assets/images/public/exyon-logo.png';

const DashboardDefault = () => {
  const [produtos, setProdutos] = useState([]);
  const [listView, setListView] = useState(false);

  useEffect(() => {
    const savedProdutos = localStorage.getItem('produtos');
    if (savedProdutos) {
      setProdutos(JSON.parse(savedProdutos));
    }
  }, []);

  

  const buttonStyle = {
    width: '80px',
    height: '34px',
    flexShrink: 0,
    borderRadius: '4px',
    color: 'rgba(0, 0, 0, 0.40)',
    fontFamily: '"Open Sans", Helvetica, sans-serif',
    fontSize: '11px',
    fontWeight: 400,
    lineHeight: 'normal',
    marginRight: '10px'
  };

  return (
    <Grid 
      container 
      rowSpacing={4.5} 
      columnSpacing={2.75} 
      style={{ backgroundColor: 'white', paddingTop: '15px' }}
    >
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            style={{
              fontFamily: '"Open Sans", Helvetica, sans-serif',
              fontWeight: 600,
              color: '#1c447c',
              fontSize: '20px',
              letterSpacing: 0
            }}
          >
            Seus Produtos
          </Typography>
          <Hidden only="xs">
            <div>
              <Button 
                  onClick={() => setListView(true)} 
                  style={{ 
                    ...buttonStyle, 
                    color: listView ? '#32465D' : 'rgba(0, 0, 0, 0.40)',
                    backgroundColor: listView ? '#33698E1A' : 'transparent' 
                  }}
                  startIcon={<FormatListBulletedIcon />}
                >
                  Lista
              </Button>
              <Button 
                  onClick={() => setListView(false)} 
                  style={{ 
                    ...buttonStyle, 
                    color: !listView ? '#32465D' : 'rgba(0, 0, 0, 0.40)',
                    backgroundColor: !listView ? '#33698E1A' : 'transparent' 
                  }}
                  startIcon={<WindowIcon />}
                >
                  Grade
              </Button>
            </div>
          </Hidden>
        </div>
      </Grid>

      {produtos.filter(produto => produto.acessoLiberado).map((produto, idx) => (
        <Grid key={idx} item xs={12} sm={listView ? 12 : 6} md={listView ? 12 : 4} lg={listView ? 12 : 3}>
            <AnalyticEcommerce 
              listView={listView}
              title={produto.nome}
              extra={produto.acessoLiberado ? "35,000" : "0"}
              icon={produto.acessoLiberado ? BalanceIcon : null}
              image={!produto.acessoLiberado ? Logo2 : null}
              disabled={!produto.acessoLiberado}
              p={produto.descricao || "Produto não disponível"}
              titleStyle={{
                fontFamily: '"Open Sans-SemiBold", Helvetica',
                fontWeight: 600,
                color: '#32465d',
                fontSize: '14px',
                letterSpacing: 0
              }}
              pStyle={{
                fontFamily: '"Open Sans-Light", Helvetica',
                fontWeight: 300,
                color: '#00000099',
                fontSize: '12px'
              }}
            />
        </Grid>
      ))}

      <Grid item xs={12}>
        <Divider />
      </Grid>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography
          style={{
            fontFamily: '"Open Sans", Helvetica, sans-serif',
            fontWeight: 600,
            color: '#1c447c',
            fontSize: '20px',
            letterSpacing: 0
          }}
        >
          Outros Produtos
        </Typography>
      </Grid>

      {produtos.filter(produto => !produto.acessoLiberado).map((produto, idx) => (
        <Grid key={idx} item xs={12} sm={listView ? 12 : 6} md={listView ? 12 : 4} lg={listView ? 12 : 3}>
            <AnalyticEcommerce 
              listView={listView}
              title={produto.nome}
              extra={produto.acessoLiberado ? "35,000" : "0"}
              icon={produto.acessoLiberado ? BalanceIcon : null}
              image={!produto.acessoLiberado ? Logo2 : null}
              disabled={!produto.acessoLiberado}
              p={produto.descricao || "Produto não disponível"}
              titleStyle={{
                fontFamily: '"Open Sans-SemiBold", Helvetica',
                fontWeight: 600,
                color: '#32465d',
                fontSize: '14px',
                letterSpacing: 0
              }}
              pStyle={{
                fontFamily: '"Open Sans-Light", Helvetica',
                fontWeight: 300,
                color: '#00000099',
                fontSize: '12px'
              }}
            />
        </Grid>
      ))}
    </Grid>
  );
};

export default DashboardDefault;

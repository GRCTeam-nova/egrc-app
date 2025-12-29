import React from 'react';
import { Grid } from '@mui/material';

const SamplePage = () => {
  const tenantRaw = localStorage.getItem("selected_tenant") || "";
  let tenantId = "";
  try {
    const tenantObj = JSON.parse(tenantRaw);
    tenantId = tenantObj?.idTenant || "";
  } catch (e) {
    console.error("Erro ao parsear tenant:", e);
  }

  const fileName = "teste.xlsx";
  const token = localStorage.getItem('access_token');
  const wopiSrc = `https://egrc-ext.homologacao.com.br/wopi/files/${fileName}?access_token=${token}`;
  const encodedWopiSrc = encodeURIComponent(wopiSrc);

  console.log("Tenant ID:", tenantId);

  const url = `https://egrc-collabora.homologacao.com.br/browser/${tenantId}/cool.html?WOPISrc=${encodedWopiSrc}`;

  return (
    <Grid container style={{ width: '100%', height: '80vh' }}>
      <Grid item xs={12} style={{ height: '100%' }}>
        <iframe
          src={url}
          title="Embedded App"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </Grid>
    </Grid>
  );
};

export default SamplePage;

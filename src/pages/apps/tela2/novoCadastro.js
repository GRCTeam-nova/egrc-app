import React, { useState } from "react";
import { Grid, Button, Box, Typography } from "@mui/material";

function ColumnsLayouts() {
  const [htmlContent, setHtmlContent] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        "https://api.egrc.homologacao.com.br/api/converters/doc-to-html",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const html = await res.text();
      setHtmlContent(html);
      setJsonData(null);
    } catch (err) {
      console.error(err);
      setError("Falha ao converter documento.");
    } finally {
      setLoading(false);
    }
  };

  const handleXlsUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        "https://api.egrc.homologacao.com.br/api/converters/xls-to-json",
        {
          method: "POST",
          body: formData,
        }
      );
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const json = await res.json();
      setJsonData(json);
      setHtmlContent("");
    } catch (err) {
      console.error(err);
      setError("Falha ao converter planilha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item>
        <Button component="label" variant="contained">
          Upload DOC(X)
          <input
            type="file"
            accept=".doc,.docx"
            hidden
            onChange={handleDocUpload}
          />
        </Button>
      </Grid>
      <Grid item>
        <Button component="label" variant="contained">
          Upload XLS(X)
          <input
            type="file"
            accept=".xls,.xlsx"
            hidden
            onChange={handleXlsUpload}
          />
        </Button>
      </Grid>

      {loading && (
        <Grid item xs={12}>
          <Typography>Carregando...</Typography>
        </Grid>
      )}
      {error && (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}

      {htmlContent && (
        <Grid item xs={12}>
          <Box
            sx={{
              bgcolor: "#fff",
              color: "#000",
              p: 2,
              borderRadius: 1,
              overflow: "auto",
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </Grid>
      )}

      {jsonData && (
        <Grid item xs={12}>
          <Box
            sx={{
              bgcolor: "#fff",
              color: "#000",
              p: 2,
              borderRadius: 1,
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            <Typography variant="h6">Dados da Planilha</Typography>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default ColumnsLayouts;

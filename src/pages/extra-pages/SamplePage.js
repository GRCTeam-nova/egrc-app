import React, { useState } from "react";
import { Grid, Button, Box, Typography } from "@mui/material";
import { getLibreOfficeBaseUrl } from '../../runtimeEnv';

// URL base do seu servidor Collabora/LibreOffice Online.
// Configure em .env como REACT_APP_LO_BASE_URL
const LO_BASE_URL = getLibreOfficeBaseUrl();

function ColumnsLayouts() {
  const [htmlContent, setHtmlContent] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loUrl, setLoUrl] = useState("");

  // Pega o token do localStorage (mesma lógica do useGetEmpresa)
  const getAuthToken = () => localStorage.getItem("access_token");

  // Inicia uma sessão WOPI no seu back-end e monta a URL para o iframe do Collabora
  const startCollabora = async (file) => {
    const token = getAuthToken();
    if (!token) throw new Error("Token não encontrado");

    // Envie o arquivo para seu endpoint que registra o WOPI e retorna um wopiSrc
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/lo/init", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error("Erro ao iniciar editor");
    const { wopiSrc } = await res.json();

    // URL do iframe apontando para seu Collabora Online
    const url = `${LO_BASE_URL}/loleaflet/dist/admin/admin.html?WOPISrc=${encodeURIComponent(
      wopiSrc
    )}`;
    setLoUrl(url);
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Token não encontrado");

      // Converter para HTML (opcional)
      const formData = new FormData();
      formData.append("file", file);
      const resHtml = await fetch(
        "https://api.egrc.homologacao.com.br/api/converters/doc-to-html",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!resHtml.ok) throw new Error(`Erro ${resHtml.status}`);
      const html = await resHtml.text();
      setHtmlContent(html);
      setJsonData(null);

      // Em seguida, inicializa o LibreOffice Online para esse arquivo
      await startCollabora(file);
    } catch (err) {
      console.error(err);
      setError("Falha ao processar documento.");
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
      const token = getAuthToken();
      if (!token) throw new Error("Token não encontrado");

      // Converter para JSON (opcional)
      const formData = new FormData();
      formData.append("file", file);
      const resJson = await fetch(
        "https://api.egrc.homologacao.com.br/api/converters/xls-to-json",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!resJson.ok) throw new Error(`Erro ${resJson.status}`);
      const json = await resJson.json();
      setJsonData(json);
      setHtmlContent("");

      // Também inicializa o LibreOffice Online para planilhas
      await startCollabora(file);
    } catch (err) {
      console.error(err);
      setError("Falha ao processar planilha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Uploads */}
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

      {/* Status */}
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

      {/* Exibição HTML */}
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

      {/* Exibição JSON */}
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

      {/* LibreOffice Online em iframe */}
      {loUrl && (
        <Grid item xs={12}>
          <Box
            sx={{
              width: "100%",
              height: 800,
              borderRadius: 1,
              boxShadow: 3,
              overflow: "hidden",
            }}
          >
            <iframe
              title="LibreOffice Online"
              src={loUrl}
              style={{ width: "100%", height: "100%", border: 0 }}
            />
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

export default ColumnsLayouts;

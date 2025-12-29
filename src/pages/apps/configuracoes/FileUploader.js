import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Stack,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grow,
  Box,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";

const FileUploader = ({
  initialFiles = [],
  containerFolder, // ex.: 1 para empresa, 3 para risco, etc.
  idContainer, // id do registro quando houver
  onFilesChange, // callback para enviar os arquivos para o componente pai
  onFileDelete,
  buttonLabel = "Arraste e solte os arquivos ou clique para selecionar",
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [files, setFiles] = useState(initialFiles);

  // Atualiza o estado se a prop initialFiles mudar
  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  // Notifica o componente pai sempre que os arquivos mudam
  useEffect(() => {
    onFilesChange(files);
  }, [files, onFilesChange]);

  // Handler do dropzone
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        enqueueSnackbar(`${acceptedFiles.length} documento(s) adicionado(s)!`, {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
        });
        setFiles((prev) => [...prev, ...acceptedFiles]);
      }
    },
    [enqueueSnackbar]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleDelete = (index) => {
    const fileToDelete = files[index];
    setFiles((prev) => prev.filter((_, i) => i !== index));
    // Se for um arquivo já existente (não do tipo File), notifica a exclusão
    if (!(fileToDelete instanceof File) && onFileDelete) {
      onFileDelete(fileToDelete);
    }
    enqueueSnackbar("Documento removido.", {
      variant: "info",
      anchorOrigin: { vertical: "top", horizontal: "right" },
      preventDuplicate: true,
    });
  };

  const handleDownload = (file) => {
    let fileURL;
    // Se o arquivo for uma instância de File (ex.: vindo do dropzone)
    if (file instanceof File) {
      fileURL = URL.createObjectURL(file);
    }
    // Se o arquivo possuir a propriedade 'path' com uma URL válida
    else if (
      file.path &&
      typeof file.path === "string" &&
      (file.path.startsWith("http://") || file.path.startsWith("https://"))
    ) {
      fileURL = file.path;
    }
    // Verifica se possui a propriedade 'url'
    else if (file.url) {
      fileURL = file.url;
    }
    // Se for uma string, utiliza-a diretamente
    else if (typeof file === "string") {
      fileURL = file;
    } else {
      console.error("Formato do arquivo não reconhecido para download", file);
      enqueueSnackbar("Formato do arquivo não reconhecido para download.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
      });
      return;
    }

    const link = document.createElement("a");
    link.href = fileURL;
    link.setAttribute("download", file.name || file.filename || "download");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (file instanceof File) {
      URL.revokeObjectURL(fileURL);
    }
  };

  return (
    <Stack spacing={1}>
      <Paper
        variant="outlined"
        {...getRootProps()}
        sx={{
          p: 3,
          textAlign: "center",
          border: "2px dashed #1C5297",
          backgroundColor: isDragActive ? "#e3f2fd" : "#f5f5f5",
          borderRadius: 2,
          cursor: "pointer",
          transition: "all 0.3s ease",
          "&:hover": { backgroundColor: "#e3f2fd", borderColor: "#1976d2" },
        }}
      >
        <Box sx={{ mb: 1 }}>
          <CloudUploadIcon
            sx={{ fontSize: 48, color: isDragActive ? "#1976d2" : "#1C5297" }}
          />
        </Box>
        <input {...getInputProps()} />
        <Typography
          variant="h6"
          color={isDragActive ? "primary" : "textSecondary"}
        >
          {isDragActive ? "Solte os arquivos aqui" : buttonLabel}
        </Typography>
      </Paper>
      {files && files.length > 0 && (
        <List>
          {files.map((file, index) => (
            <Grow in={true} key={index} timeout={300}>
              <ListItem
                secondaryAction={
                  <>
                    <IconButton
                      edge="end"
                      onClick={() => handleDownload(file)}
                      sx={{ mr: 1 }}
                    >
                      <CloudDownloadIcon sx={{ color: "#0d47a1" }} />
                    </IconButton>
                    <IconButton edge="end" onClick={() => handleDelete(index)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={file.name || file.filename || `Arquivo ${index + 1}`}
                />
              </ListItem>
            </Grow>
          ))}
        </List>
      )}
    </Stack>
  );
};

export default FileUploader;

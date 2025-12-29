import React, { useState } from 'react';
import {
  Button,
  Grid,
  Stack,
  InputLabel,
  TextField,
  Typography,
  Divider,
  Card,
  CardContent,
  InputAdornment, // Adicionado
  IconButton      // Adicionado
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../configuracoes/LoadingOverlay";
import { enqueueSnackbar } from "notistack";
import { useToken } from "../../../api/TokenContext"; 

// Ícones
import LockResetIcon from '@mui/icons-material/LockReset';
import Visibility from '@mui/icons-material/Visibility';       // Adicionado
import VisibilityOff from '@mui/icons-material/VisibilityOff'; // Adicionado

function TrocarSenha() {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para controlar a visibilidade das senhas (O Olhinho)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validação de Senha Forte
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
    return regex.test(password);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleVoltar = () => {
    navigate('/colaboradores/lista');
  };

  const handleSubmit = async () => {
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      enqueueSnackbar("Por favor, preencha todos os campos.", { variant: "warning" });
      return;
    }

    if (!validateEmail(email)) {
      enqueueSnackbar("Por favor, insira um e-mail válido.", { variant: "warning" });
      return;
    }

    if (newPassword !== confirmPassword) {
      enqueueSnackbar("A nova senha e a confirmação não coincidem.", { variant: "error" });
      return;
    }

    if (!validatePassword(newPassword)) {
      enqueueSnackbar("A nova senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais.", { variant: "warning" });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        email: email,
        currentPassword: currentPassword,
        newPassword: newPassword
      };

      const token = localStorage.getItem('access_token');

      const response = await fetch(
        'https://api.egrc.homologacao.com.br/api/v1/collaborators/change-password',
        {
          method: 'PUT', 
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); 
        const errorMessage = errorData.message || "Erro ao trocar a senha. Verifique se o e-mail e a senha atual estão corretos.";
        throw new Error(errorMessage);
      }

      enqueueSnackbar("Senha alterada com sucesso!", { variant: "success" });
      
      // Limpar campos
      setEmail("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(error);
      enqueueSnackbar(error.message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para evitar repetição no onClick do ícone
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <LoadingOverlay isActive={loading} />
      
      <Grid container justifyContent="center" marginTop={2}>
        <Grid item xs={12} md={8} lg={6}>
            <Card>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                        <LockResetIcon color="primary" fontSize="large" />
                        <Typography variant="h4">Alteração de Senha</Typography>
                    </Stack>
                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={3}>
                        
                        {/* Campo E-mail */}
                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <InputLabel>E-mail do Colaborador *</InputLabel>
                                <TextField
                                    fullWidth
                                    type="email"
                                    placeholder="exemplo@empresa.com.br"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Stack>
                        </Grid>

                        {/* Senha Atual */}
                        <Grid item xs={12}>
                            <Stack spacing={1}>
                                <InputLabel>Senha Atual *</InputLabel>
                                <TextField
                                    fullWidth
                                    // Alterna entre text e password
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    placeholder="Digite a senha atual"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    // Adiciona o ícone
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton
                                            aria-label="alternar visibilidade da senha"
                                            onClick={() => setShowCurrentPassword((show) => !show)}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                          >
                                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                        </InputAdornment>
                                      )
                                    }}
                                />
                            </Stack>
                        </Grid>

                        {/* Nova Senha */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                                <InputLabel>Nova Senha *</InputLabel>
                                <TextField
                                    fullWidth
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Nova senha forte"
                                    helperText="Minúsculas, maiúsculas, números e caracteres especiais."
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton
                                            onClick={() => setShowNewPassword((show) => !show)}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                          >
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                        </InputAdornment>
                                      )
                                    }}
                                />
                            </Stack>
                        </Grid>

                        {/* Confirmar Senha */}
                        <Grid item xs={12} md={6}>
                            <Stack spacing={1}>
                                <InputLabel>Confirmar Nova Senha *</InputLabel>
                                <TextField
                                    fullWidth
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Repita a nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    InputProps={{
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          <IconButton
                                            onClick={() => setShowConfirmPassword((show) => !show)}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                          >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                          </IconButton>
                                        </InputAdornment>
                                      )
                                    }}
                                />
                            </Stack>
                        </Grid>

                        {/* Botões */}
                        <Grid item xs={12} sx={{ pt: 2 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={handleVoltar}
                                    disabled={loading}
                                >
                                    Listagem de usuários
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    Confirmar troca
                                </Button>
                            </Stack>
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>
        </Grid>
      </Grid>
    </>
  );
}

export default TrocarSenha;
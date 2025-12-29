// LoadingOverlay.js
import React from 'react';
import { Backdrop, CircularProgress, Typography, Box, Paper } from '@mui/material';

export default function LoadingOverlay({
  open = false,          // novo nome padrão
  isActive,              // retrocompatível (se vier, tem precedência)
  message = 'Carregando dados...',
  hint,                  // opcional: dica contextual ("Buscando riscos...", etc.)
}) {
  const show = typeof isActive === 'boolean' ? isActive : open;

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(4px)',
        backgroundColor: 'rgba(6, 12, 18, 0.65)',
        p: 2,
      }}
      open={!!show}
    >
      <Paper
        elevation={8}
        sx={{
          px: 4,
          py: 3,
          borderRadius: 3,
          minWidth: 320,
          maxWidth: '90vw',
          textAlign: 'center',
          background:
            'linear-gradient(180deg, rgba(22,29,39,0.92) 0%, rgba(18,24,32,0.92) 100%)',
          color: '#e6eef6',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={58} thickness={4} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {message}
        </Typography>

        {hint && (
          <Typography
            variant="body2"
            sx={{ mt: 1, opacity: 0.8, letterSpacing: 0.2 }}
          >
            {hint}
          </Typography>
        )}
      </Paper>
    </Backdrop>
  );
}

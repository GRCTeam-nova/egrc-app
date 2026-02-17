import React from "react";
import { Backdrop, Typography, Box, Paper, Fade } from "@mui/material";
import { keyframes } from "@mui/system";

const spinRight = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const spinLeft = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
`;

const pulseCore = keyframes`
  0%, 100% { transform: scale(0.85); opacity: 0.7; box-shadow: 0 0 10px rgba(0, 163, 255, 0.2); }
  50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 25px rgba(0, 163, 255, 0.8); }
`;

const pulseText = keyframes`
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
`;

export default function LoadingOverlay({
  open = false,
  isActive,
  message = "Processando dados...",
  hint,
}) {
  const show = typeof isActive === "boolean" ? isActive : open;

  return (
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 999,
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(10, 15, 25, 0.75)",
      }}
      open={!!show}
      transitionDuration={{ enter: 600, exit: 800 }}
    >
      <Fade
        in={!!show}
        timeout={{ enter: 800, exit: 800 }}
        style={{ transitionDelay: show ? "150ms" : "0ms" }}
      >
        <Paper
          elevation={24}
          sx={{
            px: 5,
            py: 4,
            borderRadius: 4,
            minWidth: 340,
            maxWidth: "90vw",
            textAlign: "center",
            background:
              "linear-gradient(145deg, rgba(22,30,41,0.95) 0%, rgba(13,18,25,0.95) 100%)",
            color: "#e6eef6",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Container da Animação do Scanner/Radar */}
          <Box
            sx={{
              position: "relative",
              width: 80,
              height: 80,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 3,
            }}
          >
            {/* Anel Externo (Tracejado) */}
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "2px dashed rgba(0, 163, 255, 0.4)",
                animation: `${spinRight} 8s linear infinite`,
              }}
            />
            {/* Anel Interno (Sólido com opacidade diferente) */}
            <Box
              sx={{
                position: "absolute",
                width: "70%",
                height: "70%",
                borderRadius: "50%",
                border: "2px solid rgba(0, 212, 255, 0.6)",
                borderTopColor: "transparent",
                borderBottomColor: "transparent",
                animation: `${spinLeft} 3s linear infinite`,
              }}
            />
            {/* Núcleo Pulsante (Representando o Processamento/IA) */}
            <Box
              sx={{
                width: "30%",
                height: "30%",
                borderRadius: "50%",
                backgroundColor: "#00a3ff",
                animation: `${pulseCore} 2s ease-in-out infinite`,
              }}
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              letterSpacing: 0.5,
              animation: `${pulseText} 2.5s ease-in-out infinite`,
            }}
          >
            {message}
          </Typography>

          {hint && (
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: "#8ba1b8",
                letterSpacing: 0.3,
                fontSize: "0.85rem",
                textTransform: "uppercase",
              }}
            >
              {hint}
            </Typography>
          )}
        </Paper>
      </Fade>
    </Backdrop>
  );
}

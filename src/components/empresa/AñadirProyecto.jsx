"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Fab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from 'next/navigation'; 

export default function ProjectCard() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();

  const handleAddProyect = () => {
    router.push('/user/empresa/solicitudProjecto');
  };

  return (
    <Card sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", maxWidth: "100%" }}>
      <CardMedia
        component="img"
        sx={{
          width: isSmallScreen ? "100%" : 160,
          height: isSmallScreen ? 140 : "auto",
          objectFit: "cover",
          marginRight: isSmallScreen ? 0 : 2,
          padding: 1
        }}
        image="/empresa/add_Proyect.png"
        alt="Project Image"
      />
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, position: "relative" }}>
        <CardContent>
          <Typography variant="h5" component="div" sx={{ mb: 2 }}>
            Añadir proyecto
          </Typography>
          <Typography variant="body2" color="text.secondary">
            En esta sección puedes enviar una solicitud al portal para pedir un préstamo financiero llenando un formulario de solicitud.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Usa el botón de acción flotante para comenzar.
          </Typography>
        </CardContent>

        <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
          <Fab color="primary" aria-label="add" onClick={handleAddProyect}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>
    </Card>
  );
}

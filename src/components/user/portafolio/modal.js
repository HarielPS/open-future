"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogActions, Button, Card, CardHeader, CardActions, CardMedia, CardContent, Typography, Avatar, IconButton, Box } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../firebase";
import { useTheme } from "@mui/material/styles";
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { red } from '@mui/material/colors';

const ProjectModal = ({ open, onClose, project }) => {
  const [empresaData, setEmpresaData] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchEmpresaData = async () => {
      if (project?.empresa) {
        const empresaRef = doc(db, "empresa", project.empresa.id);
        const empresaDoc = await getDoc(empresaRef);
        if (empresaDoc.exists()) {
          setEmpresaData(empresaDoc.data());
        } else {
          console.error("Empresa document not found!");
        }
      }
    };

    if (open && project) {
      fetchEmpresaData();
    }
  }, [open, project]);

  const montoRecaudado = parseFloat(project?.monto_recaudado) || 0;
  const montoPedido = parseFloat(project?.monto_pedido) || 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth
      PaperProps={{ 
        style: { 
          backgroundColor: 'transparent', 
          boxShadow: 'none' 
        } 
      }}
    >
      <Card sx={{ maxWidth: 645, margin: 'auto', background: theme.palette.background.paper }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: red[500] }} aria-label="project">
              {empresaData?.nombre?.charAt(0) || 'P'}
            </Avatar>
          }
          action={
            <IconButton aria-label="settings">
              <MoreVertIcon />
            </IconButton>
          }
          title={project?.titulo || "Detalles del Proyecto"}
          subheader={empresaData?.nombre || "Desconocida"}
        />
        {empresaData?.logo && (
          <CardMedia
            component="img"
            height="194"
            image={empresaData.logo}
            alt={`${empresaData?.nombre} Logo`}
          />
        )}
        <CardContent>
          <Typography variant="body1" color="text.secondary">
            <strong>Monto Recaudado:</strong> ${montoRecaudado.toFixed(2)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Monto Pedido:</strong> ${montoPedido.toFixed(2)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Rendimiento:</strong> {project?.rendimiento}%
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Descripción:</strong> {project?.descripcion}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Fecha de Caducidad:</strong> {project?.fecha_caducidad_format}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Ubicación:</strong> {project?.ubicacion}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <strong>Proyectos Completados:</strong> {project?.estado_proyecto}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton aria-label="share">
            <ShareIcon />
          </IconButton>
          <Box sx={{ marginLeft: 'auto' }}>
            <Button onClick={onClose} variant="contained" color="primary">
              Cerrar
            </Button>
          </Box>
        </CardActions>
      </Card>
    </Dialog>
  );
};

export default ProjectModal;

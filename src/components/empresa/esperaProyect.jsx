"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Modal,
  Backdrop,
  Fade,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from "../../../firebase";

export default function ProjectCards({ project, contract,contractId }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const currentDate = new Date();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleConfirmPayment = async () => {
    try {
      // Update the contract with the current date
      const contractRef = doc(db, 'contrato', contractId);
      await updateDoc(contractRef, {
        fecha_contrato: currentDate,
        estado: 'Fondeo',
        // Add other fields to update if needed
      });

      // Implement other payment logic here
      console.log("Payment confirmed and contract date updated");

      handleClose();
      window.location.href = "/user/empresa/inicio";
    } catch (error) {
      console.error("Error updating contract date:", error);
    }
  };

  return (
    <>
      <Card sx={{ display: "flex", flexDirection: isSmallScreen ? "column" : "row", maxWidth: "100%", mb: 3 }}>
        <CardMedia
          component="img"
          sx={{
            width: isSmallScreen ? "100%" : 160,
            height: isSmallScreen ? 140 : "auto",
            objectFit: "cover",
            marginRight: isSmallScreen ? 0 : 2,
            padding: 1,
          }}
          image={project.imageUrl || "/empresa/espera.png"}
          alt="Project Image"
        />
        <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
          <CardContent>
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
              {project.titulo || "Título del Proyecto"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {project.descripcion || "Descripción del proyecto aquí."}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleOpen}>
              Confirmar Pago de Garantía
            </Button>
          </CardContent>
        </Box>
      </Card>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography id="transition-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
              Confirmar Pago
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Estás a punto de pagar la garantía para el proyecto:
            </Typography>
            <Typography variant="subtitle1" color="text.primary" sx={{ fontWeight: 'bold', mb: 1 }}>
              {project.titulo}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Monto de Garantía: <strong>${contract.garantia}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Gas Fee: <strong>$2 (estimado)</strong>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Monto Total: <strong>${parseInt(contract.garantia) + 2}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
              Fecha de Contrato: {currentDate.toLocaleDateString()}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
              onClick={handleConfirmPayment}
            >
              Confirmar y Pagar
            </Button>
          </Box>
        </Fade>
      </Modal>
    </>
  );
}

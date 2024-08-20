"use client";
import React, { useState } from 'react';
import { Button, Modal, Box, Typography, Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

const CompanyModals = () => {
  const [status, setStatus] = useState(''); // Para guardar el valor del Select
  const [openModal, setOpenModal] = useState(false);

  const handleSelectChange = (event) => {
    setStatus(event.target.value);
  };

  const handleOpenModal = () => {
    if (status) {
      setOpenModal(true);
    } else {
      alert("Por favor selecciona una opción antes de continuar.");
    }
  };

  const handleCloseModal = () => {
    // No hacemos nada aquí para evitar el cierre
  };

  const handleOkClick = () => {
    setOpenModal(false);
    if (status === 'aprobado') {
      console.log("Redirigido a aprobado");
    } else if (status === 'rechazado') {
      console.log("Redirigido a rechazado");
    }
  };

  return (
    <div>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="status-select-label">Estado</InputLabel>
        <Select
          labelId="status-select-label"
          id="status-select"
          value={status}
          label="Estado"
          onChange={handleSelectChange}
        >
          <MenuItem value="aprobado">Aprobado</MenuItem>
          <MenuItem value="rechazado">Rechazado</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        Mostrar Modal
      </Button>

      {/* Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="status-modal-title"
        aria-describedby="status-modal-description"
        closeAfterTransition
      >
        <Box sx={modalStyle} onClick={(e) => e.stopPropagation()}>
          {status === 'aprobado' ? (
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <CheckCircleIcon style={{ fontSize: 80, color: 'green' }} />
              </Grid>
              <Grid item xs>
                <Typography id="status-modal-title" variant="h5" component="h2">
                  HAS SIDO APROBADO
                </Typography>
                <Typography id="status-modal-description" sx={{ mt: 2 }}>
                  Tu empresa ha sido aprobada, ahora estarás dada de alta en la aplicación y podrás iniciar sesión con tu wallet, y acceder a las distintas opciones del sitio.
                </Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <HighlightOffIcon style={{ fontSize: 80, color: 'red' }} />
              </Grid>
              <Grid item xs>
                <Typography id="status-modal-title" variant="h5" component="h2">
                  LO LAMENTAMOS
                </Typography>
                <Typography id="status-modal-description" sx={{ mt: 2 }}>
                  Tu empresa lastimosamente no tiene las características para presentar sus solicitudes para financiamiento, sin embargo, lo invitamos a seguir impulsando su empresa.
                </Typography>
              </Grid>
            </Grid>
          )}
          <Button onClick={handleOkClick} variant="contained" color={status === 'aprobado' ? 'primary' : 'secondary'} sx={{ mt: 3, display: 'block', ml: 'auto' }}>
            OK
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default CompanyModals;

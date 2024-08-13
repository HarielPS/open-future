"use client"
import * as React from 'react';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { db, storage } from '../../../../firebase';
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

export default function AddressForm() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [userId, setUserId] = useState(null);
  const [profileImg, setProfileImg] = useState('');

  const [isChecked, setIsChecked] = useState(false);
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellidos: '',
    direccion: '',
    telefono: '',
    rfc: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleProfileImgChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        if (!userId) {
          throw new Error("No se encontró el ID de usuario en el localStorage");
        }
        const storageRef = ref(storage, `inversor/${userId}/profile.jpg`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setProfileImg(downloadURL);
        const docRef = doc(db, "inversor", userId);
        await updateDoc(docRef, { img: downloadURL });
      } catch (error) {
        console.error("Error subiendo la imagen de perfil: ", error);
      }
    }
  };

  useEffect(() => {
    const address = localStorage.getItem('connectedWalletAddress');
    const userId = localStorage.getItem('userId');
    setWalletAddress(address);
    setUserId(userId);
  }, []);
  
  const validateForm = () => {
    const errors = {};
    if (!formValues.nombre) {
      errors.nombre = 'El nombre es requerido';
    }
    if (!formValues.apellidos) {
      errors.apellidos = 'Los apellidos son requeridos';
    }
    if (!formValues.direccion) {
      errors.direccion = 'La dirección es requerida';
    }
    if (!formValues.telefono) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!/^\d+$/.test(formValues.telefono)) {
      errors.telefono = 'El teléfono solo debe contener números';
    } else if (formValues.telefono.length !== 10) {
      errors.telefono = 'El teléfono debe tener 10 dígitos';
    }
    if (!formValues.rfc) {
      errors.rfc = 'El RFC es requerido';
    } else if (formValues.rfc.length !== 13) {
      errors.rfc = 'El RFC debe tener 13 caracteres';
    }
    if (!formValues.password) {
      errors.password = 'La contraseña es requerida';
    }
    if (!formValues.confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (formValues.password !== formValues.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!isChecked) {
      errors.checkbox = 'Debes aceptar los términos y condiciones';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'telefono') {
      const numericValue = value.replace(/\D/g, ''); 
      setFormValues({ ...formValues, [name]: numericValue });
    } else {
      const upperCaseValue = (name !== 'password' && name !== 'confirmPassword') && isNaN(value) ? value.toUpperCase() : value;
      setFormValues({ ...formValues, [name]: upperCaseValue });
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const { confirmPassword, ...dataToSave } = formValues;
        const docRef = doc(db, "inversor", userId);
        await updateDoc(docRef, {
          ...dataToSave,
          monto_total_invertido: 0,
          ganancia_obtenida: 0
        });
        console.log("Documento actualizado con éxito");
        window.location.href = "/user/dashboard/inicio";
      } catch (error) {
        console.error("Error al actualizar el documento:", error);
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'background.default',
        flexDirection: 'column',
        padding: 2,
      }}
    >
      <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%', maxWidth: 600 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, width: '100%' }}>
            <Typography variant="subtitle1" gutterBottom align="center">
              Cambia tu foto de perfil desde aquí
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Avatar
                src={profileImg || "https://via.placeholder.com/150"}
                sx={{ width: 80, height: 80 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                component="label"
                color="primary"
                sx={{ mr: 2 }}
              >
                Subir Imagen
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfileImgChange}
                />
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => setProfileImg("")}>
                Resetear
              </Button>
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 2 }} align="center">
              Permitidos JPG, GIF o PNG. Tamaño máximo de 800K
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, width: '100%' }}>
            <Typography variant="h6" gutterBottom align="center">
              Información del Perfil
            </Typography>
            <Grid container spacing={3}>
              <FormGrid item xs={12} md={6}>
                <FormLabel htmlFor="name" required>
                  Nombre
                </FormLabel>
                <OutlinedInput
                  id="name"
                  name="nombre"
                  type="text"
                  placeholder="John"
                  autoComplete="name"
                  required
                  fullWidth
                  value={formValues.nombre}
                  onChange={handleInputChange}
                />
                {formErrors.nombre && <span style={{ color: 'red' }}>{formErrors.nombre}</span>}
              </FormGrid>
              <FormGrid item xs={12} md={6}>
                <FormLabel htmlFor="apellido" required>
                  Apellidos
                </FormLabel>
                <OutlinedInput
                  id="apellido"
                  name="apellidos"
                  type="text"
                  placeholder="Perez"
                  autoComplete="apellido"
                  required
                  fullWidth
                  value={formValues.apellidos}
                  onChange={handleInputChange}
                />
                {formErrors.apellidos && <span style={{ color: 'red' }}>{formErrors.apellidos}</span>}
              </FormGrid>
              <FormGrid item xs={12}>
                <FormLabel htmlFor="direccion" required>
                  Dirección
                </FormLabel>
                <OutlinedInput
                  id="direccion"
                  name="direccion"
                  type="text"
                  placeholder="Calle, número y ciudad"
                  autoComplete="shipping address-line1"
                  required
                  fullWidth
                  value={formValues.direccion}
                  onChange={handleInputChange}
                />
                {formErrors.direccion && <span style={{ color: 'red' }}>{formErrors.direccion}</span>}
              </FormGrid>
              <FormGrid item xs={6}>
                <FormLabel htmlFor="telefono" required>
                  Teléfono
                </FormLabel>
                <OutlinedInput
                  id="telefono"
                  name="telefono"
                  type="tel"
                  placeholder="Teléfono"
                  autoComplete="telefono"
                  required
                  fullWidth
                  value={formValues.telefono}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 10, pattern: "[0-9]+" }}
                />
                {formErrors.telefono && <span style={{ color: 'red' }}>{formErrors.telefono}</span>}
              </FormGrid>
              <FormGrid item xs={6}>
                <FormLabel htmlFor="rfc" required>
                  RFC
                </FormLabel>
                <OutlinedInput
                  id="rfc"
                  name="rfc"
                  type="text"
                  placeholder="RFC Code"
                  autoComplete="off"
                  required
                  fullWidth
                  value={formValues.rfc}
                  onChange={handleInputChange}
                  inputProps={{ maxLength: 13 }}
                />
                {formErrors.rfc && <span style={{ color: 'red' }}>{formErrors.rfc}</span>}
              </FormGrid>
              <FormGrid item xs={6}>
                <FormLabel htmlFor="password" required>
                  Contraseña
                </FormLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type="password"
                  placeholder="12345"
                  required
                  fullWidth
                  value={formValues.password}
                  onChange={handleInputChange}
                />
                {formErrors.password && <span style={{ color: 'red' }}>{formErrors.password}</span>}
              </FormGrid>
              <FormGrid item xs={6}>
                <FormLabel htmlFor="confirmPassword" required>
                  Confirmar contraseña
                </FormLabel>
                <OutlinedInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="12345"
                  required
                  fullWidth
                  value={formValues.confirmPassword}
                  onChange={handleInputChange}
                />
                {formErrors.confirmPassword && <span style={{ color: 'red' }}>{formErrors.confirmPassword}</span>}
              </FormGrid>
              <FormGrid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="saveAddress"
                      value="yes"
                      onChange={handleCheckboxChange}
                    />
                  }
                  label="Estoy de acuerdo con los Términos y Condiciones"
                />
                {formErrors.checkbox && <span style={{ color: 'red' }}>{formErrors.checkbox}</span>}
              </FormGrid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={!isChecked}
              onClick={handleSubmit}
              fullWidth
            >
              Guardar
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

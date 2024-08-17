"use client";
import React, { useState, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import getColor from "@/themes/colorUtils";

import {
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  Divider,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { db, storage } from '../../../../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AccountSettings() {
  const theme = useTheme();

  const [userId, setUserId] = useState(null);
  const [dense, setDense] = useState(false);
  const [secondary, setSecondary] = useState(false);
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); // 'save', 'cancel' o 'delete'
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [wallets, setWallets] = useState(new Map());
  const [profileImg, setProfileImg] = useState('');
  const [profileData, setProfileData] = useState({
    nombre: '',
    apellidos: '',
    rfc: '',
    telefono: '',
    direccion: '',
    currentPassword: ''
  });
  const [editProfileData, setEditProfileData] = useState({ ...profileData });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Esto se ejecuta solo en el cliente
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
    // Fetch data from Firestore
    const fetchData = async () => {
      try {
        const docRef = doc(db, "inversor", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            nombre: data.nombre || '',
            apellidos: data.apellidos || '',
            rfc: data.rfc || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            currentPassword: data.password || ''
          });
          setEditProfileData({
            nombre: data.nombre || '',
            apellidos: data.apellidos || '',
            rfc: data.rfc || '',
            telefono: data.telefono || '',
            direccion: data.direccion || ''
          });
          setProfileImg(data.img || '');

          // Fetch wallets
          if (data.wallet) {
            const walletData = new Map(Object.entries(data.wallet));
            setWallets(walletData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchData();
  }, [userId]);

  if (!userId) {
    return <div>Cargando...</div>;
  }

  const handleDeleteClick = (id) => {
    setSelectedItem(id);
    setDialogType('delete');
    setOpen(true);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
  };

  const handleConfirmDelete = async () => {
    const updatedWallets = new Map(wallets);
  
    let walletFound = false;
  
    updatedWallets.forEach((walletMap, provider) => {
      if (walletMap[selectedItem.split('-')[1]]) { // split para obtener la clave correcta
        delete walletMap[selectedItem.split('-')[1]]; // eliminar la wallet correcta
        walletFound = true;
      }
    });
  
    if (walletFound) {
      // Actualizar el estado inmediatamente para feedback en la UI
      setWallets(updatedWallets);
  
      // Convertir el Map actualizado a un objeto para almacenarlo en Firestore
      const updatedWalletMap = {};
      updatedWallets.forEach((walletMap, provider) => {
        updatedWalletMap[provider] = { ...walletMap };
      });
  
      try {
        const docRef = doc(db, "inversor", userId);
        await updateDoc(docRef, { wallet: updatedWalletMap }); // Actualizar Firestore con el nuevo mapa de wallets
        console.log('Wallet eliminada de Firestore');
      } catch (error) {
        console.error('Error eliminando la wallet:', error);
      }
    } else {
      console.log('No se encontró la wallet para eliminar.');
    }
  
    setOpen(false);
    setSelectedItem(null);
  };

  const handleSaveClick = async () => {
    setDialogType('save');
    setOpen(true);
  };

  const handleCancelClick = () => {
    setDialogType('cancel');
    setOpen(true);
  };

  const handleCopyClick = (event, text) => {
    if (event.target.tagName !== 'BUTTON' && event.target.tagName !== 'svg' && event.target.tagName !== 'path') {
      navigator.clipboard.writeText(text).then(() => {
        setSnackbarOpen(true);
        setTimeout(() => {
          setSnackbarOpen(false);
        }, 1000);
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDialogConfirm = async () => {
    if (dialogType === 'save') {
      try {
        const docRef = doc(db, "inversor", userId);
        const updatedData = {
          ...editProfileData,
          password: newPassword || profileData.currentPassword,
          img: profileImg
        };

        await updateDoc(docRef, updatedData);  // Actualizar Firestore

        // Vuelve a cargar los datos después de guardar
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            nombre: data.nombre || '',
            apellidos: data.apellidos || '',
            rfc: data.rfc || '',
            telefono: data.telefono || '',
            direccion: data.direccion || '',
            currentPassword: data.password || ''
          });
          setEditProfileData({
            nombre: data.nombre || '',
            apellidos: data.apellidos || '',
            rfc: data.rfc || '',
            telefono: data.telefono || '',
            direccion: data.direccion || ''
          });
          setProfileImg(data.img || '');
        }

        // Limpiar los campos de nueva contraseña y confirmación
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError(false);

        setSnackbarOpen(true);
        setTimeout(() => {
          setSnackbarOpen(false);
        }, 1000);
      } catch (error) {
        console.error("Error actualizando los datos del usuario: ", error);
      }
    } else if (dialogType === 'cancel') {
      setEditProfileData({ ...profileData });
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError(false);
    } else if (dialogType === 'delete') {
      await handleConfirmDelete();  // Aquí se llama a la función de eliminación de wallets
    }

    setEditMode(false);
    setOpen(false);
    setDialogType('');
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
    checkPasswordMatch(e.target.value, confirmPassword);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    checkPasswordMatch(newPassword, e.target.value);
  };

  const checkPasswordMatch = (newPass, confirmPass) => {
    if (newPass !== confirmPass) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const handleProfileImgChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Asegurarse de que el ID del usuario esté disponible antes de usarlo
        if (!userId) {
          throw new Error("No se encontró el ID de usuario en el localStorage");
        }
  
        // Crear la referencia al Storage
        const storageRef = ref(storage, `inversor/${userId}/profile.jpg`);
  
        // Subir la imagen
        await uploadBytes(storageRef, file);
  
        // Obtener la URL de descarga
        const downloadURL = await getDownloadURL(storageRef);
        
        // Establecer la URL de la imagen en el estado local
        setProfileImg(downloadURL);
  
        // Actualizar la referencia de la imagen en Firestore
        const docRef = doc(db, "inversor", userId);
        await updateDoc(docRef, { img: downloadURL });
  
      } catch (error) {
        console.error("Error subiendo la imagen de perfil: ", error);
      }
    }
  };

  // Validaciones

  const handleNameChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z ]/g, ''); // Solo letras y espacios, convertir a mayúsculas
    setEditProfileData({ ...editProfileData, nombre: value });
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z ]/g, ''); // Solo letras y espacios, convertir a mayúsculas
    setEditProfileData({ ...editProfileData, apellidos: value });
  };

  const handleRfcChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); // Solo letras y números, convertir a mayúsculas
    if (value.length <= 13) { // El RFC tiene una longitud máxima de 13 caracteres
      setEditProfileData({ ...editProfileData, rfc: value });
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Solo números
    if (value.length <= 10) { // Un teléfono mexicano tiene 10 dígitos
      setEditProfileData({ ...editProfileData, telefono: value });
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>
        <Button
          sx={{ direction: '' }}
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEditClick}
          disabled={editMode}
        >
          Editar
        </Button>
      </Box>

      <Divider />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Change Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Change Profile
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Cambia tu foto de perfil desde aquí
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Avatar
                src={profileImg || "https://via.placeholder.com/150"}
                sx={{ width: 80, height: 80 }}
              />
            </Box>
            {editMode && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  sx={{ mr: 2 }}
                >
                  Upload
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleProfileImgChange}
                  />
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => setProfileImg(profileData.img)}>
                  Reset
                </Button>
              </Box>
            )}
            <Typography variant="caption" display="block" sx={{ mt: 2 }} align="center">
              Permitidos JPG, GIF o PNG. Tamaño máximo de 800K
            </Typography>
          </Paper>
        </Grid>

        {/* Change Password Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Cambiar Contraseña
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Para cambiar tu contraseña, confirma aquí
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Contraseña Actual"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  variant="outlined"
                  value={profileData.currentPassword || ''}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nueva Contraseña"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={newPassword || ''}
                  onChange={handleNewPasswordChange}
                  disabled={!editMode}
                  error={passwordError}
                  helperText={passwordError ? "Las contraseñas no coinciden" : ""}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirmar Contraseña"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={confirmPassword || ''}
                  onChange={handleConfirmPasswordChange}
                  disabled={!editMode}
                  error={passwordError}
                  helperText={passwordError ? "Las contraseñas no coinciden" : ""}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Personal Details Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Detalles Personales
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Para cambiar tus datos personales, edita y guarda desde aquí
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nombre"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.nombre || ''}
                  onChange={handleNameChange}
                  disabled={!editMode}
                  inputProps={{
                    maxLength: 50, // longitud máxima del nombre
                    pattern: "[A-Z]{3,}" // mínimo 3 letras mayúsculas
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Apellido"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.apellidos || ''}
                  onChange={handleLastNameChange}
                  disabled={!editMode}
                  inputProps={{
                    maxLength: 50, // longitud máxima del apellido
                    pattern: "[A-Z]{3,}" // mínimo 3 letras mayúsculas
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="RFC"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.rfc || ''}
                  onChange={handleRfcChange}
                  disabled={!editMode}
                  inputProps={{
                    maxLength: 13, // longitud máxima del RFC
                    pattern: "[A-Z0-9]{13}" // debe ser alfanumérico de 13 caracteres
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Teléfono"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.telefono || ''}
                  onChange={handlePhoneChange}
                  disabled={!editMode}
                  inputProps={{
                    maxLength: 10, // longitud máxima del teléfono
                    pattern: "[0-9]{10}" // debe ser numérico de 10 caracteres
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.direccion || ''}
                  onChange={(e) => setEditProfileData({ ...editProfileData, direccion: e.target.value })}
                  disabled={!editMode}
                />
              </Grid>
            </Grid>
            {editMode && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                  onClick={handleSaveClick}
                  disabled={passwordError || (newPassword !== confirmPassword && newPassword !== '')}
                >
                  Guardar
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleCancelClick}>
                  Cancelar
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      {/* Wallets Section */}
      <Grid item xs={12} md={6} sx={{ width: '100%' }}>
        <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
          Wallets
        </Typography>
        <List dense={dense}>
          {[...wallets.entries()].map(([provider, walletMap]) =>
            Object.entries(walletMap).map(([key, address], index, array) => (
              <ListItem
                key={`${provider}-${key}`}
                secondaryAction={
                  array.length > 1 && ( // Solo muestra el botón si hay más de una wallet
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(`${provider}-${key}`)}>
                      <DeleteIcon />
                    </IconButton>
                  )
                }
                onClick={(event) => handleCopyClick(event, address)}
                sx={{
                  '&:hover': {
                    backgroundColor: getColor(theme, 'third'),
                    cursor: 'pointer',
                  }
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <AccountBalanceWalletIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${provider} Wallet ${key}`}
                  secondary={address}
                />
              </ListItem>
            ))
          )}
        </List>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {dialogType === 'save' ? 'Confirmar Guardado' : dialogType === 'cancel' ? 'Confirmar Cancelación' : 'Confirmar Eliminación'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogType === 'save'
              ? '¿Estás seguro de que deseas guardar estos cambios?'
              : dialogType === 'cancel'
              ? '¿Estás seguro de que deseas descartar estos cambios?'
              : '¿Estás seguro de que deseas eliminar esta wallet?'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleDialogConfirm} color="primary" autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Save Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={1000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {dialogType === 'save' ? '¡Datos guardados exitosamente!' : dialogType === 'delete' ? '¡Wallet eliminada exitosamente!' : '¡Cambios descartados!'}
        </Alert>
      </Snackbar>
    </Container>
  );
}

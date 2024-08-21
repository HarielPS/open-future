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
  InputAdornment,
  Chip,
  Select, 
  MenuItem, 
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Autocomplete from '@mui/material/Autocomplete';
import { db, storage } from '../../../../../firebase';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AccountSettings() {
  const theme = useTheme();

  const [userId, setUserId] = useState(null);
  const [dense, setDense] = useState(false);
  const [secondary, setSecondary] = useState(false);
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState(''); 
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [wallets, setWallets] = useState(new Map());
  const [profileImg, setProfileImg] = useState('');
  const [financialDocURL, setFinancialDocURL] = useState('');
  const [profileData, setProfileData] = useState({
    email: '',
    companyType: '',
    otherCompanyType: '',
    fiscalId: '',
    foundationYear: '',
    industrySectors: [],
    employees: '',
    address: '',
    website: '',
    currentPassword: '',
    financialDoc: ''
  });
  const [editProfileData, setEditProfileData] = useState({ ...profileData });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [sectorNames, setSectorNames] = useState([]);
  const [sectorInput, setSectorInput] = useState('');
  const [allSectors, setAllSectors] = useState([]);
  const [filteredSectors, setFilteredSectors] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [showOtherCompanyType, setShowOtherCompanyType] = useState(false);

  const companyTypeOptions = ["S.A.", "S.R.L.", "S.C.", "Cooperativa"];

  useEffect(() => {
    if (companyTypeOptions.includes(editProfileData.companyType) || companyTypeOptions.includes(profileData.companyType)) {
      setShowOtherCompanyType(false);
    } else {
      setShowOtherCompanyType(true);
      setEditProfileData({ 
        ...editProfileData, 
        companyType: "Otro", 
        otherCompanyType: profileData.companyType 
      });
    }
  }, [companyTypeOptions, editProfileData, profileData.companyType]);
  

  const fetchSectorNames = async (sectorRefs) => {
    const sectorNames = await Promise.all(
      sectorRefs.map(async (sectorRef) => {
        try {
          let sectorDocRef;
          let sectorPath;
  
          if (typeof sectorRef === 'string') {
            sectorPath = sectorRef.split('/').filter(part => part); 
  
            if (sectorPath.length < 2 || sectorPath.length > 3) {
              console.error(`Formato de referencia inesperado: ${sectorRef}`);
              return "Desconocido";
            }
  
            if (sectorPath.length === 2) {
              sectorDocRef = doc(db, sectorPath[0], sectorPath[1]);
            } else if (sectorPath.length === 3) {
              sectorDocRef = doc(db, sectorPath[0], sectorPath[1]);
            }
          } else {
            sectorDocRef = sectorRef;
          }
  
          const sectorSnap = await getDoc(sectorDocRef);
          if (sectorSnap.exists()) {
            const sectorData = sectorSnap.data();
  
            if (sectorPath.length === 3) {
              const fieldName = sectorPath[2];
              const index = Object.values(sectorData).indexOf(fieldName);
              const foundKey = Object.keys(sectorData)[index];
              return sectorData[foundKey] || "Desconocido";
            }
  
            return sectorData['0'] || sectorDocRef.id || "Desconocido";
          } else {
            console.error(`El documento del sector no existe: ${sectorDocRef.id}`);
            return "Desconocido";
          }
        } catch (error) {
          console.error(`Error al obtener el sector ${sectorRef}:`, error);
          return "Desconocido";
        }
      })
    );
    return sectorNames;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }

    const fetchData = async () => {
      try {
        if (!userId) {
          console.error("User ID is not defined.");
          return;
        }
    
        const docRef = doc(db, "empresa", userId);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
          const data = docSnap.data();
          const industrySectors = data.industrySectors || [];
    
          let foundationYear;
    
          if (data.foundationYear && typeof data.foundationYear.toDate === 'function') {
            foundationYear = data.foundationYear.toDate().getFullYear();
          } else {
            foundationYear = data.foundationYear || '';
          }
    
          setProfileData({
            email: data.email || '',
            companyType: data.companyType || '',
            otherCompanyType: data.otherCompanyType || '',
            fiscalId: data.fiscalId || '',
            foundationYear: foundationYear,
            industrySectors: industrySectors,
            employees: data.employees || '',
            address: data.address || '',
            website: data.website || '',
            currentPassword: data.password || '',
          });
    
          setEditProfileData({
            email: data.email || '',
            companyType: data.companyType || '',
            otherCompanyType: data.otherCompanyType || '',
            fiscalId: data.fiscalId || '',
            foundationYear: foundationYear,
            industrySectors: industrySectors,
            employees: data.employees || '',
            address: data.address || '',
            website: data.website || '',
          });
    
          setProfileImg(data.img || '');
          setFinancialDocURL(data.financialDoc || '');
    
          const sectorNames = await fetchSectorNames(industrySectors);
          setSectorNames(sectorNames);
    
          if (data.wallet) {
            const walletData = new Map(Object.entries(data.wallet));
            setWallets(walletData);
          }
        } else {
          console.error("No document found for user:", userId);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    
    fetchData();
    fetchSectors();
  }, [userId]);

  const handleFinancialDocChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        if (!userId) {
          throw new Error("No se encontró el ID de usuario en el localStorage");
        }

        const storageRef = ref(storage, `empresa/${userId}/estado_financiero/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setFinancialDocURL(downloadURL);
        const docRef = doc(db, "empresa", userId);
        await updateDoc(docRef, { financialDoc: downloadURL });

      } catch (error) {
        console.error("Error subiendo el estado financiero: ", error);
      }
    }
  };

  const fetchSectors = async () => {
    try {
      const sectorCollection = collection(db, "sector");
      const sectorSnapshot = await getDocs(sectorCollection);
      const sectors = sectorSnapshot.docs.map((doc) => ({
        id: doc.id,
        subcategories: Object.values(doc.data()).slice(1),
      }));
      setAllSectors(sectors);
    } catch (error) {
      console.error("Error fetching sectors: ", error);
    }
  };

  useEffect(() => {
    if (sectorInput) {
      const filtered = allSectors.flatMap((sector) => [
        { ...sector, isCategory: true },
        ...sector.subcategories.map(sub => ({ id: `${sector.id}-${sub}`, isCategory: false })),
      ]).filter((item) =>
        item.id.toLowerCase().includes(sectorInput.toLowerCase())
      );
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors(allSectors.flatMap((sector) => [
        { ...sector, isCategory: true },
        ...sector.subcategories.map(sub => ({ id: `${sector.id}-${sub}`, isCategory: false })),
      ]));
    }
  }, [sectorInput, allSectors]);

  const handleSectorChange = (event, value) => {
    setSectorInput(value);
  };

  const handleSectorSelect = (event, value) => {
    if (value) {
      const sectorRef = value.isCategory ? `/sector/${value.id}` : `/sector/${value.id.split('-')[0]}/${value.id.split('-')[1]}`;
      const updatedSectors = [...profileData.industrySectors, sectorRef];
      setEditProfileData({ ...editProfileData, industrySectors: updatedSectors });
      const updatedSectorNames = [...sectorNames, value.isCategory ? value.id : value.id.split('-')[1]];
      setSectorNames(updatedSectorNames);
      setSectorInput('');
    }
  };

  const renderOption = (props, option) => {
    return (
      <li {...props} key={option.id}>
        {option.isCategory ? (
          <strong>{option.id}</strong>
        ) : (
          <span style={{ marginLeft: 20 }}>{option.id.split('-')[1]}</span>
        )}
      </li>
    );
  };

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

    const [provider, key] = selectedItem.split('-');

    if (updatedWallets.has(provider)) {
        const walletMap = updatedWallets.get(provider);
        
        if (walletMap[key]) {
            delete walletMap[key];
            walletFound = true;

            // Si después de eliminar, no queda ninguna wallet para este proveedor, eliminamos la entrada del proveedor.
            if (Object.keys(walletMap).length === 0) {
                updatedWallets.delete(provider);
            } else {
                updatedWallets.set(provider, { ...walletMap });
            }
        }
    }

    // Verifica el número total de wallets restantes
    const totalRemainingWallets = [...updatedWallets.values()].reduce((sum, walletMap) => sum + Object.keys(walletMap).length, 0);

    if (walletFound && totalRemainingWallets > 0) {
        setWallets(updatedWallets);

        const updatedWalletMap = {};
        updatedWallets.forEach((walletMap, provider) => {
            updatedWalletMap[provider] = { ...walletMap };
        });

        try {
            const docRef = doc(db, "empresa", userId);
            await updateDoc(docRef, { wallet: updatedWalletMap });
            console.log('Wallet eliminada de Firestore');
        } catch (error) {
            console.error('Error eliminando la wallet:', error);
        }
    } else {
        console.log('No se encontró la wallet para eliminar o no se puede eliminar la última wallet.');
    }

    setOpen(false);
    setSelectedItem(null);
};

  const handleSaveClick = async () => {
    if (!validateForm()) return;

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
        setSnackbarMessage('Wallet copiada');
        setSnackbarOpen(true);
        setTimeout(() => {
          setSnackbarOpen(false);
        }, 1000);
      });
    }
  };

  const handleSectorDelete = async (indexToDelete) => {
    if (sectorNames.length > 1) {
      const updatedSectors = sectorNames.filter((_, index) => index !== indexToDelete);
      const updatedSectorRefs = profileData.industrySectors.filter((_, index) => index !== indexToDelete);

      setSectorNames(updatedSectors);
      setEditProfileData({
        ...editProfileData,
        industrySectors: updatedSectorRefs,
      });

      try {
        const docRef = doc(db, "empresa", userId);
        await updateDoc(docRef, { industrySectors: updatedSectorRefs });
      } catch (error) {
        console.error("Error eliminando sector: ", error);
      }
    } else {
      console.log("No se puede eliminar el último sector.");
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
        const docRef = doc(db, "empresa", userId);
        const updatedData = {
          ...editProfileData,
          companyType: showOtherCompanyType ? editProfileData.otherCompanyType : editProfileData.companyType,
          password: newPassword || profileData.currentPassword,
          img: profileImg
        };

        await updateDoc(docRef, updatedData);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            email: data.email || '',
            companyType: data.companyType || '',
            otherCompanyType: data.otherCompanyType || '',
            fiscalId: data.fiscalId || '',
            foundationYear: data.foundationYear || '',
            industrySectors: data.industrySectors || [],
            employees: data.employees || '',
            address: data.address || '',
            website: data.website || '',
            currentPassword: data.password || ''
          });
          setEditProfileData({
            email: data.email || '',
            companyType: data.companyType || '',
            otherCompanyType: data.otherCompanyType || '',
            fiscalId: data.fiscalId || '',
            foundationYear: data.foundationYear || '',
            industrySectors: data.industrySectors || [],
            employees: data.employees || '',
            address: data.address || '',
            website: data.website || ''
          });
          setProfileImg(data.img || '');
        }

        setNewPassword('');
        setConfirmPassword('');
        setPasswordError(false);

        setSnackbarMessage('¡Datos guardados exitosamente!');
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
      await handleConfirmDelete();
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
        if (!userId) {
          throw new Error("No se encontró el ID de usuario en el localStorage");
        }

        const storageRef = ref(storage, `empresa/${userId}/profile.jpg`);

        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        setProfileImg(downloadURL);

        const docRef = doc(db, "empresa", userId);
        await updateDoc(docRef, { img: downloadURL });

      } catch (error) {
        console.error("Error subiendo la imagen de perfil: ", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData({ ...editProfileData, [name]: value });

    if (name === "companyType" && value === "Otro") {
      setShowOtherCompanyType(true);
    } else if (name === "companyType" && value !== "Otro") {
      setShowOtherCompanyType(false);
      setEditProfileData({ ...editProfileData, otherCompanyType: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editProfileData.employees) {
      errors.employees = "Este campo es requerido";
    }
    if (!editProfileData.companyType) {
      errors.companyType = "Este campo es requerido";
    }
    if (showOtherCompanyType && !editProfileData.otherCompanyType) {
      errors.otherCompanyType = "Especifica el tipo de empresa";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
              Detalles de la Empresa
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Para cambiar los datos de la empresa, edita y guarda desde aquí
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Correo"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.email || ''}
                  onChange={(e) => handleInputChange(e)}
                  name="email"
                  disabled={!editMode}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.companyType}>
                  <InputLabel id="company-type-label">Tipo de Empresa</InputLabel>
                  <Select
                    labelId="company-type-label"
                    name="companyType"
                    value={editProfileData.companyType || ''}
                    onChange={handleInputChange}
                    label="Tipo de Empresa"
                    disabled={!editMode}
                  >
                    <MenuItem value={"S.A."}>S.A.</MenuItem>
                    <MenuItem value={"S.R.L."}>S.R.L.</MenuItem>
                    <MenuItem value={"S.C."}>S.C.</MenuItem>
                    <MenuItem value={"Cooperativa"}>Cooperativa</MenuItem>
                    <MenuItem value={"Otro"}>Otro</MenuItem>
                  </Select>
                  {formErrors.companyType && <FormHelperText>{formErrors.companyType}</FormHelperText>}
                </FormControl>
              </Grid>

              {showOtherCompanyType && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="otherCompanyType"
                    label="Especifica el tipo de empresa"
                    value={editProfileData.otherCompanyType || ''}
                    onChange={handleInputChange}
                    error={!!formErrors.otherCompanyType}
                    helperText={formErrors.otherCompanyType}
                    disabled={!editMode}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Número de Identificación Fiscal"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.fiscalId || ''}
                  onChange={(e) => handleInputChange(e)}
                  name="fiscalId"
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required error={!!formErrors.employees}>
                  <InputLabel id="employees-label">Número de Empleados</InputLabel>
                  <Select
                    labelId="employees-label"
                    name="employees"
                    value={editProfileData.employees || ''}
                    onChange={handleInputChange}
                    label="Número de Empleados"
                    disabled={!editMode}
                  >
                    <MenuItem value={"1-10"}>1-10</MenuItem>
                    <MenuItem value={"11-50"}>11-50</MenuItem>
                    <MenuItem value={"51-200"}>51-200</MenuItem>
                    <MenuItem value={"201-500"}>201-500</MenuItem>
                    <MenuItem value={"500+"}>500+</MenuItem>
                  </Select>
                  {formErrors.employees && <FormHelperText>{formErrors.employees}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Dirección"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.address || ''}
                  onChange={(e) => handleInputChange(e)}
                  name="address"
                  disabled={!editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Página Web"
                  fullWidth
                  variant="outlined"
                  value={editProfileData.website || ''}
                  onChange={(e) => handleInputChange(e)}
                  name="website"
                  disabled={!editMode}
                  helperText="Este campo no es requerido"
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

      {/* Industry Sectors Section */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Sectores de la Industria
          </Typography>
          {editMode && (
            <Autocomplete
              options={filteredSectors}
              getOptionLabel={(option) => option.isCategory ? option.id : option.id.split('-')[1]}
              onInputChange={handleSectorChange}
              inputValue={sectorInput}
              onChange={handleSectorSelect}
              renderOption={renderOption}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sector de la Industria"
                  helperText="Selecciona o escribe para buscar"
                  fullWidth
                />
              )}
              sx={{ flex: 1 }}
            />
          )}
          <Box sx={{ display: 'flex', alignItems:'Center', mt: 2 }}>
            {sectorNames.map((sector, index) => (
              <Chip
                key={index}
                label={sector}
                onDelete={() => handleSectorDelete(index)}
                sx={{ margin: 0.5 }}
                disabled={sectorNames.length <= 1} 
              />
            ))}
          </Box>
        </Paper>
      </Grid>

      {/* Wallets Section */}
      <Grid item xs={12} md={6} sx={{ width: '100%' }}>
        <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
          Wallets
        </Typography>
        <List dense={dense}>
          {(() => {
            const totalWallets = [...wallets.values()].reduce((sum, walletMap) => sum + Object.keys(walletMap).length, 0);
            return [...wallets.entries()].map(([provider, walletMap]) =>
              Object.entries(walletMap).map(([key, address]) => (
                <ListItem
                  key={`${provider}-${key}`}
                  secondaryAction={
                    totalWallets > 1 && ( 
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
            );
          })()}
        </List>
      </Grid>

      {/* Estado Financiero Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Estado Financiero
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Revisa y actualiza tu estado financiero desde aquí
            </Typography>
            
            {/* Vista previa del documento financiero */}
            {financialDocURL ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <iframe
                  src={financialDocURL}
                  style={{ width: '100%', height: '400px', border: 'none' }}
                  title="Vista previa del documento financiero"
                ></iframe>
              </Box>
            ) : (
              <Typography variant="caption" display="block" sx={{ mt: 2, color: 'red' }} align="center">
                No se ha subido ningún documento de estado financiero.
              </Typography>
            )}

            {/* Botón para reemplazar el documento */}
            {editMode && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  sx={{ mr: 2 }}
                >
                  Reemplazar Documento
                  <input
                    type="file"
                    hidden
                    accept="application/pdf, image/*"
                    onChange={handleFinancialDocChange}
                  />
                </Button>
              </Box>
            )}
          </Paper>
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
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

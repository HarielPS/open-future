"use client";
import React, { useState, useEffect } from "react";
import {
  Box, Grid, Paper, Typography, Avatar, Button, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Chip, Fab
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { db, storage } from '../../../../firebase';
import { doc, updateDoc, getDocs, collection, addDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import Autocomplete from '@mui/material/Autocomplete';

export default function CompanyForm() {
  const [userId, setUserId] = useState(null);
  const [profileImg, setProfileImg] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [sectorInput, setSectorInput] = useState('');
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [showOtherCompanyType, setShowOtherCompanyType] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [allSectors, setAllSectors] = useState([]);
  const [filteredSectors, setFilteredSectors] = useState([]);
  const [showAddSectorFields, setShowAddSectorFields] = useState(false);
  const [newSector, setNewSector] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    companyType: '',
    otherCompanyType: '',
    fiscalId: '',
    foundationYear: new Date(),
    industrySectors: [],
    employees: '',
    address: '',
    website: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setUserId(userId);
    fetchSectors();
  }, []);

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
        ...sector.subcategories.map(sub => ({ id: sub, isCategory: false })),
      ]).filter((item) =>
        item.id.toLowerCase().includes(sectorInput.toLowerCase())
      );
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors(allSectors.flatMap((sector) => [
        { ...sector, isCategory: true },
        ...sector.subcategories.map(sub => ({ id: sub, isCategory: false })),
      ]));
    }
  }, [sectorInput, allSectors]);

  const handleSectorChange = (event, value) => {
    setSectorInput(value);
  };

  const handleSectorSelect = (event, value) => {
    if (value && !selectedSectors.some((sector) => sector.id === value.id)) {
      setSelectedSectors([...selectedSectors, value]);
    }
    setSectorInput('');
  };

  const handleSectorDelete = (sectorToDelete) => {
    setSelectedSectors((sectors) => sectors.filter((sector) => sector !== sectorToDelete));
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

  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!formValues.email) {
      errors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'El correo es inválido';
    }

    if (!newPassword) {
      errors.password = 'La contraseña es requerida';
    } else if (newPassword.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(newPassword)) {
      errors.password = 'La contraseña debe contener al menos una letra mayúscula';
    } else if (!/[0-9]/.test(newPassword)) {
      errors.password = 'La contraseña debe contener al menos un número';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formValues.companyType) {
      errors.companyType = 'El tipo de empresa es requerido';
    }

    if (showOtherCompanyType && !formValues.otherCompanyType) {
      errors.otherCompanyType = 'El otro tipo de empresa es requerido';
    }

    if (!formValues.fiscalId) {
      errors.fiscalId = 'El Número de Identificación Fiscal es requerido';
    }

    if (!formValues.foundationYear) {
      errors.foundationYear = 'El año de fundación es requerido';
    } else if (isNaN(formValues.foundationYear.getFullYear()) || formValues.foundationYear.getFullYear() > currentYear || formValues.foundationYear.getFullYear() < 1940) {
      errors.foundationYear = `El año de fundación debe ser un número válido entre 1940 y ${currentYear}`;
    }

    if (selectedSectors.length === 0) {
      errors.industrySectors = 'Debes seleccionar al menos un sector de la industria';
    }

    if (!formValues.employees) {
      errors.employees = 'El número de empleados es requerido';
    }

    if (!formValues.address) {
      errors.address = 'La dirección es requerida';
    }

    if (!formValues.website) {
      errors.website = 'La página web es requerida';
    } else if (!/^https?:\/\/.+/.test(formValues.website)) {
      errors.website = 'La página web debe ser un link válido';
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
    setFormValues({ ...formValues, [name]: value });
  };

  const handleCompanyTypeChange = (event) => {
    const value = event.target.value;
    setFormValues({ ...formValues, companyType: value });
    setShowOtherCompanyType(value === "Otro");
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

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const dataToSave = {
          ...formValues,
          industrySectors: selectedSectors.map((sector) => sector.id),
          password: newPassword
        };
        const docRef = doc(db, "empresa", userId);
        await updateDoc(docRef, dataToSave);
        console.log("Documento actualizado con éxito");
        window.location.href = "/empresa/dashboard/inicio";
      } catch (error) {
        console.error("Error al actualizar el documento:", error);
      }
    }
  };

  const handleAddSectorClick = () => {
    setShowAddSectorFields(true);
    setIsAddingSubcategory(false);
  };

  const handleCancelAddSector = () => {
    setShowAddSectorFields(false);
    setNewSector('');
    setNewSubcategory('');
  };

  const handleAddSubcategoryClick = () => {
    setIsAddingSubcategory(true);
    setShowAddSectorFields(true);
  };

  const handleAddSector = async () => {
    try {
      let updatedSubcategories = {};

      if (isAddingSubcategory) {
        const sectorRef = doc(db, "sector", newSector);
        const sectorDoc = await getDoc(sectorRef);
        if (sectorDoc.exists()) {
          updatedSubcategories = sectorDoc.data();
          const lastKey = Math.max(...Object.keys(updatedSubcategories).map(Number));
          updatedSubcategories[lastKey + 1] = newSubcategory;
        }
        await updateDoc(sectorRef, updatedSubcategories);
      } else {
        const sectorRef = doc(db, "sector", newSector);
        updatedSubcategories = { 0: newSector };
        if (newSubcategory) {
          updatedSubcategories[1] = newSubcategory;
        }
        await setDoc(sectorRef, updatedSubcategories);
      }

      setNewSector('');
      setNewSubcategory('');
      setShowAddSectorFields(false);
      fetchSectors();
    } catch (error) {
      console.error("Error adding sector or subcategory:", error);
    }
  };

  const renderOption = (props, option) => {
    return (
      <li {...props} key={option.id}>
        {option.isCategory ? (
          <strong>{option.id}</strong>
        ) : (
          <span style={{ marginLeft: 20 }}>{option.id}</span>
        )}
      </li>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
        <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: '100%', maxWidth: 800 }}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom align="center">
                Cambia la imagen de tu empresa
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
                Información de la Empresa
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="email"
                    label="Correo"
                    value={formValues.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    name="password"
                    type="password"
                    label="Contraseña"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    error={!!formErrors.password || passwordError}
                    helperText={formErrors.password || (passwordError ? "Las contraseñas no coinciden" : "")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    required
                    name="confirmPassword"
                    type="password"
                    label="Confirmar Contraseña"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    error={!!formErrors.confirmPassword || passwordError}
                    helperText={formErrors.confirmPassword || (passwordError ? "Las contraseñas no coinciden" : "")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="company-type-label">Tipo de Empresa</InputLabel>
                    <Select
                      labelId="company-type-label"
                      name="companyType"
                      value={formValues.companyType}
                      onChange={handleCompanyTypeChange}
                      label="Tipo de Empresa"
                    >
                      <MenuItem value={"S.A."}>S.A.</MenuItem>
                      <MenuItem value={"S.R.L."}>S.R.L.</MenuItem>
                      <MenuItem value={"S.C."}>S.C.</MenuItem>
                      <MenuItem value={"Cooperativa"}>Cooperativa</MenuItem>
                      <MenuItem value={"Otro"}>Otro</MenuItem>
                    </Select>
                    {formErrors.companyType && <span style={{ color: 'red' }}>{formErrors.companyType}</span>}
                  </FormControl>
                </Grid>
                {showOtherCompanyType && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      name="otherCompanyType"
                      label="Especifica el tipo de empresa"
                      value={formValues.otherCompanyType}
                      onChange={handleInputChange}
                      error={!!formErrors.otherCompanyType}
                      helperText={formErrors.otherCompanyType}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="fiscalId"
                    label="Número de Identificación Fiscal"
                    value={formValues.fiscalId}
                    onChange={handleInputChange}
                    error={!!formErrors.fiscalId}
                    helperText={formErrors.fiscalId}
                  />
                </Grid>
                <Grid item xs={12}>
                  <DesktopDatePicker
                    views={['year']}
                    minDate={new Date('1940')}
                    maxDate={new Date()}
                    label="Año de Fundación"
                    value={formValues.foundationYear}
                    onChange={(date) => setFormValues({ ...formValues, foundationYear: date })}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    error={!!formErrors.foundationYear}
                    helperText={formErrors.foundationYear}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Autocomplete
                      options={filteredSectors}
                      getOptionLabel={(option) => option.id}
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
                    <Fab color="primary" aria-label="add" onClick={handleAddSectorClick} sx={{ ml: 2 }}>
                      <AddIcon />
                    </Fab>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems:'Center', mt: 2 }}>
                    {selectedSectors.map((sector, index) => (
                      <Chip
                        key={index}
                        label={sector.id}
                        onDelete={() => handleSectorDelete(sector)}
                        sx={{ margin: 0.5 }}
                      />
                    ))}
                  </Box>
                  {formErrors.industrySectors && <span style={{ color: 'red' }}>{formErrors.industrySectors}</span>}
                </Grid>
                {showAddSectorFields && (
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      {isAddingSubcategory ? (
                        <FormControl fullWidth required>
                          <InputLabel id="sector-select-label">Seleccionar Sector</InputLabel>
                          <Select
                            labelId="sector-select-label"
                            value={newSector}
                            onChange={(e) => setNewSector(e.target.value)}
                          >
                            {allSectors.map((sector) => (
                              <MenuItem key={sector.id} value={sector.id}>
                                {sector.id}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Box>
                        <TextField
                          fullWidth
                          label="Sector"
                          value={newSector}
                          onChange={(e) => setNewSector(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <Fab color="primary" aria-label="add" onClick={handleAddSubcategoryClick} sx={{ ml: 2 }}>
                            <AddIcon />
                        </Fab>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Subcategoría"
                          value={newSubcategory}
                          onChange={(e) => setNewSubcategory(e.target.value)}
                        />
                        {!isAddingSubcategory && (
                          <Fab color="primary" aria-label="add" onClick={handleAddSubcategoryClick} sx={{ ml: 2 }}>
                            <AddIcon />
                          </Fab>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button variant="contained" onClick={handleAddSector}>
                          Guardar {isAddingSubcategory ? "Subcategoría" : "Sector"}
                        </Button>
                        <Button variant="outlined" onClick={handleCancelAddSector}>
                          Cancelar
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="employees-label">Número de Empleados</InputLabel>
                    <Select
                      labelId="employees-label"
                      name="employees"
                      value={formValues.employees}
                      onChange={handleInputChange}
                      label="Número de Empleados"
                    >
                      <MenuItem value={"1-10"}>1-10</MenuItem>
                      <MenuItem value={"11-50"}>11-50</MenuItem>
                      <MenuItem value={"51-200"}>51-200</MenuItem>
                      <MenuItem value={"201-500"}>201-500</MenuItem>
                      <MenuItem value={"500+"}>500+</MenuItem>
                    </Select>
                    {formErrors.employees && <span style={{ color: 'red' }}>{formErrors.employees}</span>}
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="address"
                    label="Dirección"
                    value={formValues.address}
                    onChange={handleInputChange}
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="website"
                    label="Página Web"
                    value={formValues.website}
                    onChange={handleInputChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">https://</InputAdornment>,
                    }}
                    error={!!formErrors.website}
                    helperText={formErrors.website}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="termsAndConditions"
                        value="yes"
                        onChange={handleCheckboxChange}
                      />
                    }
                    label="Estoy de acuerdo con los Términos y Condiciones"
                  />
                  {formErrors.checkbox && <span style={{ color: 'red' }}>{formErrors.checkbox}</span>}
                </Grid>
              </Grid>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                disabled={!isChecked || passwordError}
                onClick={handleSubmit}
                fullWidth
              >
                Guardar
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

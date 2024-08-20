"use client";
import React, { useState, useEffect } from "react";
import {
  Box, Grid, Paper, Typography, Avatar, Button, TextField, InputAdornment, FormControl,
  InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Chip, Fab,
  Tooltip, Modal
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { db, storage } from '../../../../firebase';
import { doc, updateDoc, getDocs, collection, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL,deleteObject,listAll } from 'firebase/storage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import Autocomplete from '@mui/material/Autocomplete';
import GPT from "../../../../services/gpt/ApiGpt";
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

export default function CompanyForm() {
  const [userId, setUserId] = useState(null);
  const [profileImg, setProfileImg] = useState('');
  const [financialDoc, setFinancialDoc] = useState(null); // Estado para el documento financiero
  const [financialDocURL, setFinancialDocURL] = useState(''); // Estado para la URL del documento financiero
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
    nombre: '',
    email: '',
    companyType: '',
    otherCompanyType: '',
    fiscalId: '',
    foundationYear: new Date(),
    industrySectors: [],
    employees: '',
    address: '',
    website: '',
    empresa_aprobada: false,
  });
  const [isHttpsAdded, setIsHttpsAdded] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [detallesRechazo, setDetallesRechazo] = useState();

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
    if (value && !selectedSectors.some((sector) => sector.id === value.id)) {
        const displayName = value.isCategory ? value.id : value.id.split('-')[1]; // Solo el subnombre si es un subsector
        const sectorRef = value.isCategory ? `/sector/${value.id}` : `/sector/${value.id.split('-')[0]}/${value.id.split('-')[1]}`;
        setSelectedSectors([...selectedSectors, { ...value, displayName, sectorRef }]);
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
        const storageRef = ref(storage, `empresa/${userId}/profile_image/profile.jpg`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setProfileImg(downloadURL);
        const docRef = doc(db, "empresa", userId);
        await updateDoc(docRef, { logo: downloadURL });
      } catch (error) {
        console.error("Error subiendo la imagen de perfil: ", error);
      }
    }
  };

  const handleFinancialDocChange = async (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar que el archivo sea JPG o PNG
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert("Solo se permiten archivos JPG o PNG.");
        return;
      }
  
      // Validar que el archivo no supere los 20 MB
      const maxSize = 20 * 1024 * 1024; // 20 MB en bytes
      if (file.size > maxSize) {
        alert("El archivo no debe superar los 20 MB.");
        return;
      }
  
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
  

  const validateForm = () => {
    const errors = {};
    const currentYear = new Date().getFullYear();
  
    if (!formValues.nombre) {
      errors.nombre = 'El nombre de la Empresa es requerido';
    }
  
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
  
    // if (formValues.website && !/^https?:\/\/.+/.test(formValues.website)) {
    //   errors.website = 'La página web debe ser un link válido';
    // }
  
    if (!isChecked) {
      errors.checkbox = 'Debes aceptar los términos y condiciones';
    }
  
    if (!financialDocURL) { // Validar que se haya subido el documento financiero
      errors.financialDoc = 'Debes subir un documento de estado financiero.';
    }
  
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };  

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    // Convertir a mayúsculas si el campo es "nombre"
    const newValue = name === 'nombre' ? value.toUpperCase() : value;
    setFormValues({ ...formValues, [name]: newValue });
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
            // Convertir las referencias de los sectores seleccionados
            const industrySectors = selectedSectors.map((sector) => {
                return sector.sectorRef; // Usar la referencia correcta que incluye el sector y la subcategoría
            });

            // Ajustar el tipo de empresa si es "Otro"
            const companyType = formValues.companyType === 'Otro' ? formValues.otherCompanyType : formValues.companyType;

            const dataToSave = {
                ...formValues,
                companyType,
                industrySectors, // Guardar las referencias en el formato adecuado
                password: newPassword,
                website: "https://"+formValues.website || '', // Si no hay valor, se guarda como ''
                financialDoc: financialDocURL, // Guardar la URL del documento financiero
            };

            delete dataToSave.otherCompanyType; // Remover el campo otherCompanyType antes de guardar

            const docRef = doc(db, "empresa", userId);
            await updateDoc(docRef, dataToSave);
            console.log("Documento actualizado con éxito");
            console.log(dataToSave);
            
            const response = await GPT.analiceSignupCompany(Object.entries(dataToSave).map(([key, value]) => `${key}: ${value}`).join(", "),dataToSave.financialDoc);
            console.log(response);

            // Verificar si la respuesta está en formato JSON y convertirla si es necesario
            let parsedResponse;
            try {
              parsedResponse = JSON.parse(response);
            } catch (e) {
              console.error("Error al parsear la respuesta de OpenAI:", e);
              console.log("Respuesta original:", response);
              return;
            }
            
            if (parsedResponse && parsedResponse.empresa_aprobada !== undefined) {
              const isApproved = parsedResponse.empresa_aprobada;
              console.log("Empresa aprobada:", isApproved);
              setModalStatus(isApproved);
      
              if (!isApproved) {
                setDetallesRechazo(parsedResponse.detalles_informacion);
                console.log("Empresa no aprobada, eliminando documentos...");
                await deleteFolderContents(userId);
                await deleteDoc(docRef);
              }
            } else {
              console.log("response o empresa_aprobada no está definido.");
            }
      
            setOpenModal(true);

        } catch (error) {
            console.error("Error al actualizar el documento:", error);
        }
    }
};

const deleteFolderContents = async (userId) => {
  try {
      const folderRef = ref(storage, `empresa/${userId}`);
      
      // Listar todos los archivos y carpetas dentro de la "carpeta" del usuario
      const listResult = await listAll(folderRef);
      
      // Eliminar todos los archivos dentro de estado_financiero y profile_image
      const deletePromises = listResult.items.map(item => deleteObject(item));
      
      // Esperar hasta que todos los archivos sean eliminados
      await Promise.all(deletePromises);
      
      console.log(`Todos los archivos en empresa/${userId} han sido eliminados.`);
      
  } catch (error) {
      console.error("Error al eliminar los archivos:", error.message);
  }
};

const handleOkClick = async () => {
  setOpenModal(false);
  if (modalStatus === true) {
    window.location.href = '/user/empresa/inicio';
  } else if (modalStatus === false) {
      window.location.href = '/';
  }
};

const handleCloseModal = () => {
  // No cerrar modal si no es con OK
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
          <span style={{ marginLeft: 20 }}>{option.id.split('-')[1]}</span> // Mostrar solo el nombre del subsector
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
                {/* nombre */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="nombre"
                    label="Nombre"
                    value={formValues.nombre}
                    onChange={handleInputChange}
                    error={!!formErrors.nombre}
                    helperText={formErrors.nombre}
                  />
                </Grid>
                {/* email */}
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
                {/* password */}
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
                {/* confirmPassword */}
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
                {/* tipo de empresa */}
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
                {/* otro tipo de empresa */}
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
                {/* numero fiscal */}
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

                <Grid item xs={6}>
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
                  {/* sector de la industria */}
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Autocomplete
                        options={filteredSectors}
                        getOptionLabel={(option) => option.isCategory ? option.id : option.id.split('-')[1]} // Mostrar solo el nombre del subsector
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
                      <Tooltip title="Si no se encuentra tu sector puedes crear un nuevo sector principal o subsector">
                        <Fab color="primary" aria-label="add" onClick={handleAddSectorClick} sx={{ ml: 2 }}>
                          <AddIcon />
                        </Fab>
                      </Tooltip>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems:'Center'}}>
                      {selectedSectors.map((sector, index) => (
                        <Chip
                          key={index}
                          label={sector.displayName}
                          onDelete={() => handleSectorDelete(sector)}
                          sx={{ margin: 0.5 }}
                        />
                      ))}
                    </Box>
                    {formErrors.industrySectors && <span style={{ color: 'red' }}>{formErrors.industrySectors}</span>}
                  </Grid>
                {/* nuevo sector */}
                {showAddSectorFields && (
                  <Grid item xs={12} >
                    <Box sx={{ mb: 2 }}>
                      {isAddingSubcategory ? (
                        <Grid >
                          <Box>
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
                          </Box>
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
                        </Grid>
                      ) : (
                        <Grid item xs={12}>
                          <Box sx={{display:'flex'}}>
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
                        </Grid>
                      )}
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

                {/* input estado financiero */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom align="center">
                    Subir Estado Financiero
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <Button
                      variant="contained"
                      component="label"
                      color="primary"
                      sx={{ mr: 2 }}
                    >
                      Subir Documento
                      <input
                        type="file"
                        hidden
                        accept="application/pdf, image/*"
                        onChange={handleFinancialDocChange}
                      />
                    </Button>
                  </Box>

                  {financialDocURL ? (
                    <Typography variant="caption" display="block" sx={{ mt: 2 }} align="center">
                      Documento subido: <a href={financialDocURL} target="_blank" rel="noopener noreferrer">Ver documento</a>
                    </Typography>
                  ) : (
                    <Typography variant="caption" display="block" sx={{ mt: 2, color: 'red' }} align="center">
                      {formErrors.financialDoc} {/* Mostrar mensaje de error si no se ha subido */}
                    </Typography>
                  )}

                  <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    ¿Necesitas una plantilla? Llenala y descargala <a href="https://docs.google.com/spreadsheets/d/1Cf8FO5_sLkP7XNHzUvSLXbUQv9F4rPVDtLKKLSNYrbE/edit?usp=sharing" target="_blank" rel="noopener noreferrer">aquí</a>.
                  </Typography>
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

        {/* modal */}
        <Modal
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="status-modal-title"
          aria-describedby="status-modal-description"
        >
          <Box sx={modalStyle} onClick={(e) => e.stopPropagation()}>
            {modalStatus === true ? (
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
                  <Typography>
                    {detallesRechazo}
                  </Typography>
                </Grid>
              </Grid>
            )}
            <Button onClick={handleOkClick} variant="contained" color={modalStatus === true ? 'primary' : 'secondary'} sx={{ mt: 3, display: 'block', ml: 'auto' }}>
              OK
            </Button>
          </Box>
        </Modal>

      </Box>
    </LocalizationProvider>
  );
}

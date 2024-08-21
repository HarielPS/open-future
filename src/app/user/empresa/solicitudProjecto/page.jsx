"use client";
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Autocomplete,
  Chip,
  useTheme,
  Modal,
  Grid
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import NavigationIcon from '@mui/icons-material/Navigation';
import { db } from '../../../../../firebase';
import { collection, doc, getDocs, getDoc, setDoc,updateDoc, arrayUnion, serverTimestamp,Timestamp } from 'firebase/firestore';
import GPT from "../../../../../services/gpt/ApiGpt";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CircularProgress from '@mui/material/CircularProgress';

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

export default function LoanRequestForm() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  const [formValues, setFormValues] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    wallet: '',
    montoPedido: 0,
    categorias: [],
    objetivos: '',
    impacto: '',
    presupuesto: [{ id: 1, titulo: '', monto: 0, descripcion: '' }],
    proyeccionIngresos: '',
    puntoEquilibrio: '',
    justificacionMonto: '',
    plazoPropuesto: 0,  // Cambiado a numérico
  });

  const [totalAsignado, setTotalAsignado] = useState(0);
  const [errors, setErrors] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [BanceSheetUrl, setBanceSheetUrl] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCategorias = async () => {
      const categoriaCollection = collection(db, 'categoria');
      const categoriaSnapshot = await getDocs(categoriaCollection);
      const categoriaList = categoriaSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().nombre,
      }));
      setCategorias(categoriaList);
    };

    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === 'montoPedido' || name === 'plazoPropuesto' ? parseFloat(value) || 0 : value;

    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: parsedValue,
    }));

    if (name === 'montoPedido') {
      validateBudget(parsedValue, totalAsignado);
    }
  };

  const handleBudgetChange = (id, field, value) => {
    const parsedValue = field === 'monto' ? parseFloat(value) || 0 : value;
    const updatedPresupuesto = formValues.presupuesto.map(item =>
      item.id === id ? { ...item, [field]: parsedValue } : item
    );
    setFormValues({
      ...formValues,
      presupuesto: updatedPresupuesto,
    });

    if (field === 'monto') {
      const total = updatedPresupuesto.reduce((sum, item) => sum + item.monto, 0);
      setTotalAsignado(total);
      validateBudget(formValues.montoPedido, total);
    }
  };

  const handleAddNode = () => {
    setFormValues({
      ...formValues,
      presupuesto: [
        ...formValues.presupuesto,
        { id: formValues.presupuesto.length + 1, titulo: '', monto: 0, descripcion: '' },
      ],
    });
  };

  const handleRemoveNode = (id) => {
    const updatedPresupuesto = formValues.presupuesto.filter(item => item.id !== id);
    setFormValues({
      ...formValues,
      presupuesto: updatedPresupuesto,
    });

    const total = updatedPresupuesto.reduce((sum, item) => sum + item.monto, 0);
    setTotalAsignado(total);
    validateBudget(formValues.montoPedido, total);
  };

  const validateBudget = (montoPedido, totalAsignado) => {
    const newErrors = { ...errors };

    if (totalAsignado !== montoPedido) {
      newErrors.presupuesto = 'La distribución del presupuesto no coincide con el monto solicitado';
    } else {
      delete newErrors.presupuesto;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.titulo) newErrors.titulo = 'El título es requerido';
    if (!formValues.descripcion) newErrors.descripcion = 'La descripción es requerida';
    if (!formValues.ubicacion) newErrors.ubicacion = 'La ubicación es requerida';
    if (!formValues.wallet) newErrors.wallet = 'La wallet es requerida';
    if (formValues.montoPedido <= 0) newErrors.montoPedido = 'El monto solicitado debe ser mayor a 0';
    if (formValues.categorias.length === 0) newErrors.categorias = 'Debes seleccionar al menos una categoría';
    if (!formValues.objetivos) newErrors.objetivos = 'Los objetivos son requeridos';
    if (!formValues.impacto) newErrors.impacto = 'El impacto es requerido';
    if (!formValues.proyeccionIngresos) newErrors.proyeccionIngresos = 'La proyección de ingresos es requerida';
    if (!formValues.puntoEquilibrio) newErrors.puntoEquilibrio = 'El punto de equilibrio es requerido';
    if (!formValues.justificacionMonto) newErrors.justificacionMonto = 'La justificación del monto es requerida';
    if (formValues.plazoPropuesto <= 0) newErrors.plazoPropuesto = 'El plazo propuesto es requerido';

    validateBudget(formValues.montoPedido, totalAsignado);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertirPresupuestoAString = (presupuestoArray) => {
    return presupuestoArray.map(item => 
      `se ocupará ${item.monto} para ${item.titulo}, se usará en ${item.descripcion}`
    ).join(', ');
  };


  const handleSaveToDatabase = async (parsedResponse, formData, userId) => {
    try {
      // Crear una fecha actual y sumarle 10 días
      const currentDate = new Date();
      const expirationDate = new Date(currentDate);
      expirationDate.setDate(expirationDate.getDate() + 10);
  
      // Convertirla en Timestamp de Firestore
      const expirationTimestamp = Timestamp.fromDate(expirationDate);
  
      // Extraer "categorias" para que no sea propagado
      const { categorias, montoPedido, ...restFormData } = formData;
  
      // Crear documento en la colección "proyecto"
      const proyectoRef = doc(collection(db, "proyecto"));
      const proyectoData = {
        // ...restFormData, // Aquí solo los demás campos de formData sin "categorias"
        categoria: categorias.map(cat => doc(db, "categoria", cat.id)), // Crear el campo "categoria" con referencias
        descripcion:formData.descripcion,
        titulo:formData.titulo,
        objetivos: formData.objetivos,
        impacto: formData.impacto,
        puntoEquilibrio: formData.puntoEquilibrio,
        empresa: doc(db, "empresa", userId),
        estado_proyecto: "Espera",
        fecha_caducidad: expirationTimestamp,
        fecha_solicitud: Timestamp.now(),
        monto_pedido: formData.montoPedido,
        monto_recaudado: 0,
        ubicacion:formValues.ubicacion,
        rendimiento: parsedResponse.porcentaje_comision_aprobado,
        presupuesto: formValues.presupuesto.reduce((acc, curr, index) => {
          acc[`presupuesto_${index + 1}`] = {
            titulo: curr.titulo,
            monto: curr.monto,
            descripcion: curr.descripcion
          };
          return acc;
        }, {})
      };
  
      await setDoc(proyectoRef, proyectoData);
  
      // Crear documento en la colección "contrato"
      const contratoRef = doc(collection(db, "contrato"));
      const contratoData = {
        estado: "Espera",
        duracion_contrato: formData.plazoPropuesto,
        // fecha_contrato: null, // Dejar en blanco
        fecha_pago: 30,
        id_contrato: "1234",
        id_proyecto: proyectoRef,
        monto_pedido: formData.montoPedido,
        rendimiento: parsedResponse.porcentaje_comision_aprobado,
        wallet_empresa: formData.wallet,
        garantia: parsedResponse.garantia_aprobada
      };
      await setDoc(contratoRef, contratoData);
  
      // Actualizar el documento en la colección "empresa"
      const empresaRef = doc(db, "empresa", userId);
      await updateDoc(empresaRef, {
        "proyectos.progreso": arrayUnion(contratoRef)
      });
  
      console.log("Datos guardados exitosamente en la base de datos.");
    } catch (error) {
      console.error("Error al guardar los datos en la base de datos:", error);
    }
  };
  

  const handleSubmit = async () => {
    // Se trae balance general del storage
    const userId = localStorage.getItem('userId');
    const docRef = doc(db, "empresa", userId);
    const dataDoc = await getDoc(docRef);
    const data = dataDoc.data();
    const BalanceSheet = data.financialDoc;
    console.log(BalanceSheet);
  
    if (validateForm()) {
      setIsProcessing(true); // Mostrar modal de "Procesando"
      const presupuestoString = convertirPresupuestoAString(formValues.presupuesto);
      const formData = { ...formValues, presupuesto: presupuestoString };
      console.log('Formulario válido:', formData);
  
      let parsedResponse; // Declara parsedResponse fuera del bloque do
  
      // Aquí iría la lógica para enviar el formulario
      do {
        const response = await GPT.analicenewProjectCompany(Object.entries(formData).map(([key, value]) => `${key}: ${value}`).join(", "), BalanceSheet);
        console.log(response);
        console.log("respuesta");
  
        try {
          parsedResponse = JSON.parse(response); // parsedResponse se asigna aquí
        } catch (e) {
          console.error("Error al parsear la respuesta de OpenAI:", e);
          console.log("Respuesta original:", response);
          setIsProcessing(false); // Ocultar modal de "Procesando"
          return;
        }
  
        // console.log(parsedResponse.porcentaje_comision_aprobado);
      } while (parsedResponse.porcentaje_comision_aprobado > 100);
  
      setIsProcessing(false); // Ocultar modal de "Procesando"
      setModalStatus(parsedResponse.credito_aprobado); // Mostrar el resultado
  
      if(parsedResponse.credito_aprobado){
        await handleSaveToDatabase(parsedResponse, formData, userId);
      }
      setOpenModal(true);
        
      // Aquí llama un handle con la lógica de guardar en la base de datos

  
    } else {
      console.log('Formulario no válido:', errors);
    }
  };
  
  const handleOkClick = async () => {
    setOpenModal(false);
    if (modalStatus === true) {
      window.location.href = '/user/empresa/inicio';
    } else if (modalStatus === false) {
        window.location.href = '/user/empresa/inicio';
    }
  };

  const handleCloseModal = () => {
    // No cerrar modal si no es con OK
  };
  
  const handleCategoriaChange = (event, value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      categorias: value,
    }));
  };

  return (
    <Box sx={{ marginTop: 3 }}>
      <Button
        variant="extended"
        onClick={() => window.location.href = '/'}
        sx={{
          boxShadow: isDarkMode
            ? '0px 3px 5px -1px rgba(255, 255, 255, 0.2), 0px 6px 10px 0px rgba(255, 255, 255, 0.14), 0px 1px 18px 0px rgba(255, 255, 255, 0.12)'
            : '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
        }}
      >
        <NavigationIcon sx={{ mr: 1, transform: 'rotate(-90deg)' }} />
        Atras
      </Button>

      <Box sx={{ maxWidth: 800, margin: 'auto' }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
              mb: 5, 
              display: 'flex', 
              justifyContent: 'center', 
              textAlign: 'center' 
          }}
        >
          Solicitud de Préstamo para Proyecto
        </Typography>

        <TextField
          fullWidth
          label="Título del Proyecto"
          name="titulo"
          variant="outlined"
          value={formValues.titulo}
          onChange={handleChange}
          error={!!errors.titulo}
          helperText={errors.titulo}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Descripción"
          name="descripcion"
          variant="outlined"
          value={formValues.descripcion}
          onChange={handleChange}
          error={!!errors.descripcion}
          helperText={errors.descripcion}
          multiline
          rows={3}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Ubicación"
          name="ubicacion"
          variant="outlined"
          value={formValues.ubicacion}
          onChange={handleChange}
          error={!!errors.ubicacion}
          helperText={errors.ubicacion}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Wallet"
          name="wallet"
          variant="outlined"
          value={formValues.wallet}
          onChange={handleChange}
          error={!!errors.wallet}
          helperText={errors.wallet}
          sx={{ mb: 3 }}
        />

        <Autocomplete
          multiple
          options={categorias}
          getOptionLabel={(option) => option.nombre}
          value={formValues.categorias}
          onChange={handleCategoriaChange}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Categorías del Proyecto"
              variant="outlined"
              error={!!errors.categorias}
              helperText={errors.categorias}
              sx={{ mb: 3 }}
            />
          )}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => (
              <Chip
                key={option.id}
                label={option.nombre}
                {...getTagProps({ index })}
              />
            ))
          }
        />

        <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
          Descripción del Proyecto
        </Typography>

        <TextField
          fullWidth
          label="Objetivos"
          name="objetivos"
          variant="outlined"
          value={formValues.objetivos}
          onChange={handleChange}
          error={!!errors.objetivos}
          helperText={errors.objetivos}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Impacto"
          name="impacto"
          variant="outlined"
          value={formValues.impacto}
          onChange={handleChange}
          error={!!errors.impacto}
          helperText={errors.impacto}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
          Monto y Plazo del Préstamo
        </Typography>

        <TextField
          fullWidth
          label="Monto Pedido"
          name="montoPedido"
          variant="outlined"
          type="number"
          value={formValues.montoPedido}
          onChange={handleChange}
          error={!!errors.montoPedido}
          helperText={errors.montoPedido}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Justificación del Monto Solicitado"
          name="justificacionMonto"
          variant="outlined"
          value={formValues.justificacionMonto}
          onChange={handleChange}
          error={!!errors.justificacionMonto}
          helperText={errors.justificacionMonto}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Plazo Propuesto (meses)"
          name="plazoPropuesto"
          variant="outlined"
          type="number"  // Cambiado a tipo numérico
          value={formValues.plazoPropuesto}
          onChange={handleChange}
          error={!!errors.plazoPropuesto}
          helperText={errors.plazoPropuesto}
          sx={{ mb: 3 }}
        />

        <Typography variant="h6" sx={{ mt: 5, mb: 2 }}>
          Análisis Financiero
        </Typography>

        <Timeline position="alternate">
          {formValues.presupuesto.map((item) => (
            <TimelineItem key={item.id}>
              <TimelineOppositeContent
                sx={{ m: 'auto 0' }}
                align="right"
                variant="body2"
                color="text.secondary"
              >
                ${item.monto || 0}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color="primary">
                  <AccountTreeIcon />
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <TextField
                  fullWidth
                  label="Área de Presupuesto"
                  variant="outlined"
                  value={item.titulo}
                  onChange={(e) => handleBudgetChange(item.id, 'titulo', e.target.value)}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Descripción"
                  variant="outlined"
                  value={item.descripcion}
                  onChange={(e) => handleBudgetChange(item.id, 'descripcion', e.target.value)}
                  multiline
                  rows={2}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  label="Monto"
                  variant="outlined"
                  type="number"
                  value={item.monto}
                  onChange={(e) => handleBudgetChange(item.id, 'monto', parseFloat(e.target.value) || 0)}
                />
                <Button
                  color="error"
                  sx={{ mt: 1 }}
                  startIcon={<RemoveCircleIcon />}
                  onClick={() => handleRemoveNode(item.id)}
                  disabled={formValues.presupuesto.length === 1}
                >
                  Eliminar
                </Button>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>

        {errors.presupuesto && <Typography color="error" sx={{ mb: 3 }}>{errors.presupuesto}</Typography>}

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3, mb: 5 }}
          startIcon={<AddCircleIcon />}
          onClick={handleAddNode}
        >
          Añadir Área
        </Button>

        <TextField
          fullWidth
          label="Proyección de Ingresos"
          name="proyeccionIngresos"
          variant="outlined"
          value={formValues.proyeccionIngresos}
          onChange={handleChange}
          error={!!errors.proyeccionIngresos}
          helperText={errors.proyeccionIngresos}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Punto de Equilibrio"
          name="puntoEquilibrio"
          variant="outlined"
          value={formValues.puntoEquilibrio}
          onChange={handleChange}
          error={!!errors.puntoEquilibrio}
          helperText={errors.puntoEquilibrio}
          multiline
          rows={2}
          sx={{ mb: 3 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Enviar Solicitud
        </Button>
      </Box>

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
                    TU SOLICITUD HA SIDO APROBADA
                  </Typography>
                  <Typography id="status-modal-description" sx={{ mt: 2 }}>
                    Tu solicitud se presentara en la plataforma para los inversores, y podras ver su estado en los apartados correspondientes.
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
                    Tu solicitud no ah sido aprovada, te animamos a segir adelante y plantearla mejor de neuvo para presentarla
                  </Typography>
                </Grid>
              </Grid>
            )}
            <Button onClick={handleOkClick} variant="contained" color={modalStatus === true ? 'primary' : 'secondary'} sx={{ mt: 3, display: 'block', ml: 'auto' }}>
              OK
            </Button>
          </Box>
        </Modal>

        <Modal
          open={isProcessing}
          onClose={() => {}}
          aria-labelledby="processing-modal-title"
          aria-describedby="processing-modal-description"
        >
          <Box sx={modalStyle} onClick={(e) => e.stopPropagation()}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <CircularProgress />
              </Grid>
              <Grid item xs>
                <Typography id="processing-modal-title" variant="h5" component="h2">
                  Procesando la solicitud
                </Typography>
                <Typography id="processing-modal-description" sx={{ mt: 2 }}>
                  Por favor, espera mientras procesamos tu solicitud. Esto puede tomar algunos momentos.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Modal>


    </Box>
  );
}
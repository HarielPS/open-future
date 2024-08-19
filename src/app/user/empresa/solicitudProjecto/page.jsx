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
import { collection, getDocs } from 'firebase/firestore';

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
    plazoPropuesto: '',
  });

  const [totalAsignado, setTotalAsignado] = useState(0);
  const [errors, setErrors] = useState({});
  const [categorias, setCategorias] = useState([]);

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
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    if (name === 'montoPedido') {
      validateBudget(value, totalAsignado);
    }
  };

  const handleBudgetChange = (id, field, value) => {
    const updatedPresupuesto = formValues.presupuesto.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormValues({
      ...formValues,
      presupuesto: updatedPresupuesto,
    });

    if (field === 'monto') {
      const total = updatedPresupuesto.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
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

    const total = updatedPresupuesto.reduce((sum, item) => sum + parseFloat(item.monto || 0), 0);
    setTotalAsignado(total);
    validateBudget(formValues.montoPedido, total);
  };

  const validateBudget = (montoPedido, totalAsignado) => {
    const newErrors = { ...errors };

    if (parseFloat(totalAsignado) !== parseFloat(montoPedido)) {
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
    if (!formValues.plazoPropuesto) newErrors.plazoPropuesto = 'El plazo propuesto es requerido';

    validateBudget(formValues.montoPedido, totalAsignado);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertirPresupuestoAString = (presupuestoArray) => {
    return presupuestoArray.map(item => 
      `se ocupará ${item.monto} para ${item.titulo}, se usará en ${item.descripcion}`
    ).join(', ');
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const presupuestoString = convertirPresupuestoAString(formValues.presupuesto);
      const formData = { ...formValues, presupuesto: presupuestoString };
      console.log('Formulario válido:', formData);
      // Aquí iría la lógica para enviar el formulario
    } else {
      console.log('Formulario no válido:', errors);
    }
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
          label="Plazo Propuesto"
          name="plazoPropuesto"
          variant="outlined"
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
    </Box>
  );
}

// pages/index.js
"use client";
import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import InvestmentHistory from "@/components/user/historial/tabla";
import { Box } from "@mui/material";
import getColor from "@/themes/colorUtils";
import { useTheme } from '@mui/material/styles';
import { db } from '../../../../../firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from '@mui/material/Tooltip';

const BasicDateCalendar = dynamic(() => import('@/components/user/historial/calendarmui'), { ssr: false });

export default function Page() {
  const theme = useTheme();
  const [montototal, setMontoTotal] = useState(null);
  const [gananciatotal, setGananciaTotal] = useState(null);
  const [gananciaActual, setGananciaActual] = useState(null);
  const [events, setevents] = useState(null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      handleCard(storedId);
      handleEvents(storedId);
    }
  }, []);

  const handleCard = async (id) => {
    try {
      const investorDoc = await getDoc(doc(db, "inversor", id));
      if (investorDoc.exists()) {
        const investorData = investorDoc.data();
        const progress = investorData.proyectos?.progreso || {};
        const pagos = investorData.pagos || {};
  
        let totalMonto = 0;
        let totalGanancia = 0;
        let gananciaActual = 0;
  
        // Calculate totalMonto and gananciaActual
        for (const pagoId in pagos) {
          const pagoData = pagos[pagoId];
          const contratoRef = pagoData.id_contrato;
  
          if (contratoRef && pagoData.estado) {
            const contratoDoc = await getDoc(contratoRef);
            if (contratoDoc.exists() && (contratoDoc.data().estado === 'Activo' || contratoDoc.data().estado === 'Fondeo')) {
              if (pagoData.tipo === 'salida') {
                totalMonto += parseFloat(pagoData.monto) || 0;
              } else if (pagoData.tipo === 'entrada' && pagoData.estado === 'pagado') {
                gananciaActual += parseFloat(pagoData.monto) || 0;
              }
            }
          }
        }
  
        // Calculate totalGanancia (same logic as before)
        for (const key in progress) {
          const contratoRef = progress[key];
          const contratoDoc = await getDoc(contratoRef);
          if (contratoDoc.exists()) {
            const contratoData = contratoDoc.data();
            const inversorMap = contratoData.inversores || {};
            const inversorData = inversorMap[id];
  
            if (inversorData && contratoData.estado === 'Activo') {
              totalGanancia += parseFloat(inversorData.ganancia) * parseFloat(contratoData.duracion_contrato) || 0;
            }
          }
        }
  
        setMontoTotal(totalMonto);
        setGananciaTotal(totalGanancia);
        setGananciaActual(gananciaActual);
      }
    } catch (error) {
      console.error("Error obteniendo datos del inversor:", error);
    }
  };
  
  const handleEvents = async (id) => {
    try {
        const investorDoc = await getDoc(doc(db, "inversor", id));
        if (investorDoc.exists()) {
            const investorData = investorDoc.data();
            const progress = investorData.proyectos?.progreso || {};
            const finalizados = investorData.proyectos?.finalizados || {};
        
            let newEvents = [];
        
            const agregarEventos = async (proyectoRef) => {
                const contratoDoc = await getDoc(proyectoRef);
                if (contratoDoc.exists()) {
                    const contratoData = contratoDoc.data();
                    const estadoContrato = contratoData.estado;

                    if (estadoContrato === 'Activo' || estadoContrato === 'Finalizado') {
                        const inversorMap = contratoData.inversores || {};
                        const inversorData = inversorMap[id];

                        if (inversorData) {
                            const idProyectoRef = contratoData.id_proyecto;
                            const idProyectoDoc = await getDoc(idProyectoRef);
                            if (idProyectoDoc.exists()) {
                                const proyectoData = idProyectoDoc.data();
                                const idEmpresaRef = proyectoData.empresa;

                                if (idEmpresaRef) {
                                    const idEmpresaDoc = await getDoc(idEmpresaRef);
                                    if (idEmpresaDoc.exists()) {
                                        const empresaData = idEmpresaDoc.data();
                                        let fechaContrato = contratoData.fecha_contrato.toDate();
                                        const duracion = parseInt(contratoData.duracion_contrato, 10);
                                        const fechaPago = parseInt(contratoData.fecha_pago, 10);

                                        for (let mes = 0; mes < duracion; mes++) {
                                            const fecha = new Date(fechaContrato);
                                            
                                            // Añadir los meses correspondientes
                                            fecha.setMonth(fecha.getMonth() + mes);

                                            // Ajustar la fecha sumando los días especificados
                                            fecha.setDate(fechaContrato.getDate() + fechaPago - 1); // Restar 1 día para corregir el conteo

                                            // Comprobar si la nueva fecha se pasa del último día del mes
                                            if (fecha.getDate() > new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate()) {
                                                const extraDays = fecha.getDate() - new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getDate();
                                                fecha.setMonth(fecha.getMonth() + 1);
                                                fecha.setDate(extraDays);
                                            }

                                            newEvents.push({
                                                date: fecha.toISOString().split('T')[0],
                                                name: proyectoData.titulo || 'Proyecto sin nombre',
                                                empresa: empresaData.nombre || 'Empresa desconocida',
                                                amount: (inversorData.monto_invertido / duracion) + (inversorData.ganancia || 0),
                                            });

                                            // Actualizar fechaContrato para la siguiente iteración
                                            fechaContrato = fecha;
                                        }
                                    } else {
                                        console.log("El documento de empresa no existe");
                                    }
                                } else {
                                    console.log("El campo empresa no tiene una referencia válida");
                                }
                            } else {
                                console.log("El documento de proyecto no existe");
                            }
                        }
                    }
                }
            };
        
            // Agregar eventos de proyectos en progreso y finalizados
            for (const key in progress) {
                await agregarEventos(progress[key]);
            }
        
            for (const key in finalizados) {
                await agregarEventos(finalizados[key]);
            }
        
            setevents(newEvents);
            console.log(newEvents);
        }
    } catch (error) {
        console.error("Error obteniendo datos del inversor:", error);
    }
};



  return (
    <Box sx={{ height: "100vh", width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: '5vh',
        }}
      >
        <h1>Historial</h1>
      </Box>
      <Box sx={{ height: "100%", width: '100%', display: 'flex' }}>
        <Box sx={{ width: '70%', height: "100%", paddingRight: 4 }}>
          <Box sx={{ textAlign: "center", marginBottom: '5vh' }}>
            <Typography variant="h5" color="textprimary">
              Payments Table
            </Typography>
          </Box>
          <InvestmentHistory />
        </Box>
        <Box sx={{ width: '30%', height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: "center", marginBottom: '5vh' }}>
            <Typography variant="h5" color="textprimary">
              Payment Schedule
            </Typography>
          </Box>
          <Box sx={{ flex: 0.4, width: '100%', height: '100%', borderRadius: 2, padding: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 15, boxShadow: `1px 1px 9px 10px ${getColor(theme, 'shadow')}` }}>
            <BasicDateCalendar events={events} />
          </Box>

          <Box
            sx={{
              flex: 0.6,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
              borderRadius: 2,
              boxShadow: `1px 1px 9px 10px ${getColor(theme, 'shadow')}`
            }}
          >
            <Tooltip title="Este es el monto total que has invertido actualmente en proyectos en estado Activo y Fondeo.">
              <Box sx={{ textAlign: "center", width: '100%' }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                  Monto total invertido
                </Typography>
                <Typography variant="h4" color="primary">
                  ${montototal !== null ? montototal.toFixed(2)  : '-'}
                </Typography>
              </Box>
            </Tooltip>

            <Divider orientation="horizontal" flexItem sx={{ marginY: '10px', width: '80%', alignSelf: 'center' }} />

            <Tooltip title="Esta es la ganancia actual generada por tus inversiones en contratos en estado Activo.">
              <Box sx={{ textAlign: "center", width: '100%' }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                  Ganancias actual
                </Typography>
                <Typography variant="h4" color="primary">
                  ${gananciaActual !== null ? gananciaActual.toFixed(2)  : '-'}
                </Typography>
              </Box>
            </Tooltip>

            <Divider orientation="horizontal" flexItem sx={{ marginY: '10px', width: '80%', alignSelf: 'center' }} />

            <Tooltip title="Estas son las ganancias esperadas que podrías obtener de tus inversiones en contratos Activos, No incluye proyectos en Fondeo.">
              <Box sx={{ textAlign: "center", width: '100%' }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                  Ganancias esperadas
                </Typography>
                <Typography variant="h4" color="primary">
                  ${gananciatotal !== null ? gananciatotal.toFixed(2) : '-'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}

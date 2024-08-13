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
        const now = new Date();
  
        // Calculate totalMonto and gananciaActual
        for (const pagoId in pagos) {
          const pagoData = pagos[pagoId];
          const contratoRef = pagoData.id_contrato;
  
          if (contratoRef && pagoData.estado) {
            const contratoDoc = await getDoc(contratoRef);
            if (contratoDoc.exists() && contratoDoc.data().estado === 'Activo') {
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
            const inversorMap = contratoData.inversores || {};
            const inversorData = inversorMap[id];
            const idProyectoRef = contratoData.id_proyecto;
    
            if (inversorData) {
              const idProyectoDoc = await getDoc(idProyectoRef);
              if (idProyectoDoc.exists()) {
                const proyectoData = idProyectoDoc.data();
                const idEmpresaRef = proyectoData.empresa; // Obtener referencia a la empresa
    
                if (idEmpresaRef) {
                  const idEmpresaDoc = await getDoc(idEmpresaRef);
                  if (idEmpresaDoc.exists()) {
                    const empresaData = idEmpresaDoc.data(); // Obtener datos de la empresa
    
                    const fechaContrato = contratoData.fecha_contrato.toDate();
    
                    for (let mes = 0; mes < contratoData.duracion_contrato; mes++) {
                      const fechaPago = new Date(fechaContrato);
                      fechaPago.setMonth(fechaPago.getMonth() + mes);
                      fechaPago.setDate(fechaPago.getDate() + contratoData.fecha_pago);
    
                      newEvents.push({
                        date: fechaPago.toISOString().split('T')[0], // Formatear la fecha como 'YYYY-MM-DD'
                        name: proyectoData.titulo || 'Proyecto sin nombre', // Accede a los datos correctos
                        empresa: empresaData.nombre || 'Empresa desconocida', // Accede a los datos correctos de la empresa
                        amount: (inversorData.monto_invertido / contratoData.duracion_contrato) + (inversorData.ganancia || 0),
                      });
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
        };
    
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
          <InvestmentHistory />
        </Box>
        <Box sx={{ width: '30%', height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
            <Box sx={{ textAlign: "center", width: '100%' }}>
              <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                Monto total invertido
              </Typography>
              <Typography variant="h4" color="primary">
                ${montototal !== null ? montototal : '-'}
              </Typography>
            </Box>

            <Divider orientation="horizontal" flexItem sx={{ marginY: '10px', width: '80%', alignSelf: 'center' }} />

            <Box sx={{ textAlign: "center", width: '100%' }}>
              <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                Ganancias actual
              </Typography>
              <Typography variant="h4" color="primary">
                ${gananciaActual !== null ? gananciaActual : '-'}
              </Typography>
            </Box>

            <Divider orientation="horizontal" flexItem sx={{ marginY: '10px', width: '80%', alignSelf: 'center' }} />

            <Box sx={{ textAlign: "center", width: '100%' }}>
              <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                Ganancias esperadas
              </Typography>
              <Typography variant="h4" color="primary">
                ${gananciatotal !== null ? gananciatotal : '-'}
              </Typography>
            </Box>
          </Box>

        </Box>
      </Box>
    </Box>
  );
}

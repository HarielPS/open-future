"use client";
import React, { useState, useEffect } from "react";
import CardInfoInicio from "@/components/user/inicio/CardInfoInicio";
import MyResponsivePie from "@/components/grafica/pastel";
import MyResponsiveLine from "@/components/grafica/histograma";
import { Box, Alert, Typography } from "@mui/material";
import MyResponsiveBar from "@/components/grafica/barras";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../firebase";

const Page = () => {
  const [gridHeight, setGridHeight] = useState('calc(100% - 240px)');
  
  const [proyectosEnProgreso, setProyectosEnProgreso] = useState(0);
  const [proyectosFinalizados, setProyectosFinalizados] = useState(0);
  const [inversionTotal, setInversionTotal] = useState(0);
  const [gananciasTotales, setGananciasTotales] = useState(0);

  const updateGridHeight = () => {
    const screenHeight = window.innerHeight;
    if (screenHeight < 600) {
      setGridHeight('100% - 100px'); // Ajuste para pantallas pequeñas
    } else {
      setGridHeight('calc(100% - 240px)'); // Ajuste para pantallas grandes
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const investorDoc = await getDoc(doc(db, "inversor", userId));
        if (investorDoc.exists()) {
          const investorData = investorDoc.data();
          
          // Obtener la longitud de los mapas progreso y finalizados
          const proyectosEnProgresoCount = investorData.proyectos?.progreso ? Object.keys(investorData.proyectos.progreso).length : 0;
          const proyectosFinalizadosCount = investorData.proyectos?.finalizados ? Object.keys(investorData.proyectos.finalizados).length : 0;

          // Obtener los valores de monto_total_invertido y ganancia_obtenida
          const inversionTotalValue = investorData.monto_total_invertido || 0;
          const gananciasTotalesValue = investorData.ganancia_obtenida || 0;

          // Actualizar los estados
          setProyectosEnProgreso(proyectosEnProgresoCount);
          setProyectosFinalizados(proyectosFinalizadosCount);
          setInversionTotal(inversionTotalValue);
          setGananciasTotales(gananciasTotalesValue);
        } else {
          console.warn("Investor document does not exist for user:", userId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    updateGridHeight(); // Establece el valor inicial
    window.addEventListener('resize', updateGridHeight); // Actualiza el valor cuando se redimensiona la ventana
    return () => window.removeEventListener('resize', updateGridHeight);
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100vh' }}>
      <Box
        sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom:'5vh'}}
      >
        <h1>Home</h1>
      </Box>
      <Box sx={{ height: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ height: '100%', width: '100%' }}>
          <MyResponsiveLine />
        </Box>
      </Box>
      <div className="flex flex-wrap justify-between mt-8">
        <CardInfoInicio
          title={"Proyectos en Progreso"}
          numPrin={proyectosEnProgreso}
          icon={"pi-history"}
          numText={""}
          text={"Número de proyectos en los que actualmente has invertido y estas generando ganancia (Proyectos Activos) o se está recaudando el monto completo de inversión por lo que todavía no hay ganancias (Proyectos en Fondeo)"}
          link={"portafolio"}
          color={"bg-green-500"}
        />
        <CardInfoInicio
          title={"Proyectos Finalizados"}
          numPrin={proyectosFinalizados}
          icon={"pi-flag-fill"}
          numText={""}
          text={"Número de proyectos que has invertido y ya terminaron su tiempo de contrato (Proyectos Finalizados) o se canceló el fondeo y se devolvió el dinero a los inversores (Proyectos Cancelados)"}
          link={"portafolio"}
          color={"bg-red-600"}
        />
        <CardInfoInicio
          title={"Inversión Total"}
          numPrin={inversionTotal}
          icon={"pi-money-bill"}
          numText={""}
          text={"Cantidad invertida de todas las inversiones realizadas a través de la plataforma hasta el momento."}
          link={"historial"}
          color={"bg-blue-600"}
        />
        <CardInfoInicio
          title={"Ganancias Totales"}
          numPrin={gananciasTotales}
          icon={"pi-chart-line"}
          numText={""}
          text={"Ganancias acumuladas de todas las inversiones realizadas a través de la plataforma hasta el momento."}
          link={"wallet"}
          color={"bg-yellow-600"}
        />
      </div>

      {(proyectosEnProgreso > 0 || proyectosFinalizados > 0) ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', height: 'calc(100% - 150px)', mt: 2 }}>
          <Box sx={{ height: '100%', width: { xs: '100%', md: '50%' } }}>
            <MyResponsiveBar />
          </Box>

          <Box sx={{ height: '100%', width: { xs: '100%', md: '50%' }, mt: { xs: 10, md: 0 } }}>
            <MyResponsivePie />
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ textAlign: 'center', margin: '20px 0', width: '100%' }}>
          Actualmente no cuentas con proyectos para visualizar más información general.
        </Alert>
      )}
    </Box>
  );
}

export default Page;

"use client";
import React, { useState, useEffect } from "react";
import { Box } from "@mui/system";
import InvestmentTable from "@/components/user/portafolio/tabla";
import { Typography, Divider, Alert } from "@mui/material";
import MyResponsivePieAdjusted from "@/components/grafica/dona";
import getColor from "@/themes/colorUtils";
import { useTheme } from '@mui/material/styles';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../../firebase";

export default function Page() {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inversorDocRef = doc(db, "inversor", userId);
        const inversorDoc = await getDoc(inversorDocRef);

        if (inversorDoc.exists()) {
          const proyectos = inversorDoc.data().proyectos;
          const progreso = proyectos.progreso || {};
          const finalizados = proyectos.finalizados || {};

          const totalProjects = Object.keys(progreso).length + Object.keys(finalizados).length;
          setTotalProjects(totalProjects);

          let rowsData = [];
          let totalInvestedAmount = 0;
          let statusCounts = {
            "Finalizado": 0,
            "Activo": 0,
            "Fondeo": 0,
            "Cancelado": 0,
          };

          const processContract = async (contractId) => {
            const contractDocRef = doc(db, "contrato", contractId.id);
            const contractDoc = await getDoc(contractDocRef);

            if (contractDoc.exists()) {
              const contractData = contractDoc.data();
              const projectRef = contractData.id_proyecto;
              const inversorData = contractData.inversores[userId];

              if (inversorData && inversorData.fecha) {
                const dueDate = new Date(inversorData.fecha.toDate());
                dueDate.setDate(dueDate.getDate() + contractData.fecha_pago);

                const projectDoc = await getDoc(projectRef);
                const projectName = projectDoc.exists() ? projectDoc.data().titulo : "Desconocido";
                const empresaRef = projectDoc.data().empresa;
                const empresaDoc = await getDoc(empresaRef);
                const logo = empresaDoc.exists() ? empresaDoc.data().logo : "";

                statusCounts[contractData.estado] += 1;

                const montoInvertido = typeof inversorData.monto_invertido === 'string' 
                  ? parseFloat(inversorData.monto_invertido.replace(/[^0-9.-]+/g, "")) 
                  : inversorData.monto_invertido;

                if (contractData.estado !== "Cancelado") {
                  totalInvestedAmount += montoInvertido;
                }

                const earnings = inversorData.ganancia !== undefined ? parseFloat(inversorData.ganancia) : null;

                rowsData.push({
                  project: projectName,
                  term: parseInt(contractData.duracion_contrato, 10) + " meses",
                  investment: montoInvertido,
                  earnings: earnings,
                  dueDate: dueDate.toLocaleDateString(),
                  status: contractData.estado,
                  img: logo,
                  fecha_contrato: contractData.fecha_contrato.toDate().toLocaleDateString(),
                  key: contractDocRef.id, // Only save contract ID
                });
              } else {
                console.error("Inversor Data or Fecha is undefined for contract:", contractDocRef.id);
              }
            }
          };

          for (const contractId of Object.values(progreso)) {
            await processContract(contractId);
          }

          for (const contractId of Object.values(finalizados)) {
            await processContract(contractId);
          }

          setRows(rowsData);
          setTotalInvested(totalInvestedAmount);

          setPieData([
            { id: "Finalizado", label: "Finalizado", value: statusCounts['Finalizado'], color: "hsl(124, 70%, 50%)" },
            { id: "Activo", label: "Activo", value: statusCounts['Activo'], color: "hsl(90, 10%, 10%)" },
            { id: "Fondeo", label: "Fondeo", value: statusCounts['Fondeo'], color: "hsl(100, 70%, 50%)" },
            { id: "Cancelado", label: "Cancelado", value: statusCounts['Cancelado'], color: "hsl(0, 70%, 50%)" },
          ]);

        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document: ", error);
      }
    };
    fetchData();
  }, [userId]);

  return (
    <Box sx={{ width: '100%', height: '100vh', padding:'0 2% 2% 2%'}}>
      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom:'5vh'}}>
        <h1>Portafolio</h1>
      </Box>

      {totalProjects > 0 ? (
        <>
          <Box sx={{display:'flex', flexDirection: { xs: "column", md: "row" }, alignItems: 'center', height: { xs: '100%', md: '40%' }, marginBottom:'2vh', background: getColor(theme,"seven"), borderRadius: 2, padding: 2, boxShadow: 1 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 2,
                backgroundColor: getColor(theme,"fifth_rev"),
                borderRadius: 2,
                boxShadow: 1,
                width: { xs: '100%', md: '50%' },
                height: '100%',
                marginRight: { xs: 0, md: '2vh' },
                marginBottom: { xs: '2vh', md: 0 }
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                  Monto total invertido
                </Typography>
                <Typography variant="h4" color="primary">
                  ${totalInvested.toLocaleString('en-US')}
                </Typography>
              </Box>

              <Divider orientation="horizontal" flexItem sx={{ marginY: '10px', width: '80%' }} />

              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle1" color="textSecondary" sx={{ marginBottom: '1vh' }}>
                  Proyectos totales
                </Typography>
                <Typography variant="h4" color="primary">
                  {totalProjects}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ height: '100%', width: { xs: '100%', md: '50%' }, background:getColor(theme,"fifth_rev"), borderRadius: 2, boxShadow: 1, padding:1 , alignContent:'center'}}>
              <MyResponsivePieAdjusted data={pieData} />
            </Box>
          </Box>

          <Box sx={{ height: 'calc(70% - 2vh)', marginTop: '2vh' }}>
            <Box sx={{ height: '100%'}}>
              <InvestmentTable rows={rows} />
            </Box>
          </Box>
        </>
      ) : (
        <Alert severity="info" sx={{ textAlign: 'center', margin: '20px 0' }}>
          No tienes proyectos actualmente. ¡Empieza a invertir para verlos aquí!
        </Alert>
      )}
    </Box>
  );
}

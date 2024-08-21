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
  const [userId, setuserId] = useState (null);

  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    if (storedId) {
      setuserId(storedId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      console.log(userId);
    const fetchData = async () => {
      try {
        const inversorDocRef = doc(db, "empresa", userId);
        const inversorDoc = await getDoc(inversorDocRef);

        if (inversorDoc.exists()) {
          console.log(inversorDoc.data())
          const proyectos = inversorDoc.data().proyectos || {};
          console.log(proyectos);


          // Asegurarse de que progreso y finalizados sean arrays antes de iterarlos
          const progreso = Array.isArray(proyectos.progreso) ? proyectos.progreso : [];
          const finalizados = Array.isArray(proyectos.finalizados) ? proyectos.finalizados : [];

          console.log("Progreso:", progreso);
          console.log("Finalizados:", finalizados);

          const totalProjects = progreso.length + finalizados.length;
          setTotalProjects(totalProjects);

          let rowsData = [];
          let totalInvestedAmount = 0;
          let statusCounts = {
            "Espera": 0,
            "Finalizado": 0,
            "Activo": 0,
            "Fondeo": 0,
            "Cancelado": 0,
          };

          const processContract = async (contractDocRef) => {
            if (!contractDocRef) {
              console.error("Invalid contractDocRef", contractDocRef);
              return;
            }
            console.log(contractDocRef);
            const contractDoc = await getDoc(contractDocRef);
            const contractData = contractDoc.data();
            console.log(contractData);
            if (contractDoc.exists()) {
              const contractData = contractDoc.data();
              const projectRef = contractData.id_proyecto;
              const projectDoc = await getDoc(projectRef);
              const projectData = projectDoc.data();
              console.log(projectData);
          
                const projectName = projectDoc.exists() ? projectDoc.data().titulo : "Desconocido";
                const empresaRef = projectDoc.data().empresa;
                const empresaDoc = await getDoc(empresaRef);
                const logo = empresaDoc.exists() ? empresaDoc.data().logo : "";
          
                statusCounts[contractData.estado] += 1;
                    
                rowsData.push({
                  project: projectName,
                  term: parseInt(contractData.duracion_contrato, 10) + " meses",
                  // investment: montoInvertido,
                  // earnings: earnings,
                  // dueDate: dueDate.toLocaleDateString(),
                  status: contractData.estado,
                  img: logo,
                  // fecha_contrato: contractData.fecha_contrato.toDate().toLocaleDateString(),
                  key: contractDocRef.id,
                });

            } else {
              console.error("Contract does not exist for ID:", contractDocRef.id);
            }
          };

          for (const contractDocRef of progreso) {
            console.log("entro al for");
            await processContract(contractDocRef);
          }
          
          for (const contractDocRef of finalizados) {
            await processContract(contractDocRef);
          }

          console.log(rowsData)
          setRows(rowsData);
          setTotalInvested(totalInvestedAmount);

          setPieData([
            { id: "Espera", label: "Espera", value: statusCounts['Espera'], color: "hsl(268, 70%, 55%)" },
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
  }
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

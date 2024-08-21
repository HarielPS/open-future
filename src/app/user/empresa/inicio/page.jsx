"use client";
import { useEffect, useState } from 'react';
import { Box, Alert, Typography,Tooltip } from '@mui/material';
import ProjectCard from '@/components/empresa/AñadirProyecto';
import ProjectCards from '@/components/empresa/esperaProyect';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase';

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found');
        }

        // Access the 'empresa' collection
        const empresaDocRef = doc(db, 'empresa', userId);
        const empresaDocSnap = await getDoc(empresaDocRef);

        if (empresaDocSnap.exists()) {
          const proyectos = empresaDocSnap.data().proyectos.progreso;
          const esperaProjects = [];

          for (let contratoRef of proyectos) {
            const contratoDocSnap = await getDoc(contratoRef);

            if (contratoDocSnap.exists() && contratoDocSnap.data().estado === 'Espera') {
              const projectData = await getDoc(contratoDocSnap.data().id_proyecto);
              if (projectData.exists()) {
                esperaProjects.push({
                  id: contratoDocSnap.id,
                  contract: { ...contratoDocSnap.data(), id: contratoDocSnap.id }, // Incluyendo el id en el contrato
                  project: projectData.data(),
                });
              }
            }
          }

          setProjects(esperaProjects);
        } else {
          console.log('No such document in empresa collection!');
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Box sx={{ mt: 5 }}>
      <Box sx={{marginBottom:7}}>
        <ProjectCard/>
      </Box>
      {projects.length > 0 ? (
        <Box>
          <Tooltip title="Es necesario realizar un pago de garantia para que tu solicitud, comience su etapa de fondeo ">
            <Typography variant="h6" component="div" sx={{ marginBottom: 2 }}>
              Proyectos en espera
            </Typography>
          </Tooltip>
        <Box>
          {projects.map((item) => (
            <ProjectCards key={item.id} project={item.project} contract={item.contract} contractId={item.id} />
          ))}
        </Box>
      </Box>

      ) : (
        <Alert severity="info">No projects in "Espera" state found.</Alert>
      )}
    </Box>
  );
};

export default ProjectsPage;

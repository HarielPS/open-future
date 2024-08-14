"use client";
import React, { useEffect, useState } from 'react';
import CardFinance from '@/components/card/Card';
import { Box, Pagination } from '@mui/material';
import { db } from '../../../../../firebase';
import { formatDistanceToNow, format } from 'date-fns';
import Loading from '@/components/loading/loading';
import MaximizableDemo from '@/components/user/proyectos/ModalProyectos';

const ITEMS_PER_PAGE = 5;

export default function Page() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [pageBounds, setPageBounds] = useState([]); // Guardamos los límites de cada página

  const fetchProjects = async (page) => {
    setLoading(true);

    try {
      let query = db.collection('proyecto')
        .where('estado_proyecto', '==', 'Fondeo')
        .orderBy('fecha_solicitud')
        .limit(ITEMS_PER_PAGE);

      // Ajustar la consulta para paginación
      if (page > 1 && pageBounds[page - 2]) {
        query = query.startAfter(pageBounds[page - 2]);
      }

      const querySnapshot = await query.get();

      // Procesar los datos obtenidos
      const projectPromises = querySnapshot.docs.map(async (doc) => {
        let data = doc.data();
        data.id = doc.id;

        if (data.empresa) {
          const empresaDoc = await data.empresa.get();
          if (empresaDoc.exists) {
            data = {
              ...data,
              imagen_solicitud: empresaDoc.data().logo,
              empresa: empresaDoc.data().nombre,
            };
          }
        }

        if (data.categoria && Array.isArray(data.categoria)) {
          const categoryNames = await Promise.all(data.categoria.map(async (catRef) => {
            const catDoc = await catRef.get();
            return catDoc.exists ? catDoc.data().nombre : "Unknown";
          }));
          data = { ...data, categoria: categoryNames };
        }

        const fechaSolicitudDate = data.fecha_solicitud.toDate();
        data.timeAgo = formatDistanceToNow(fechaSolicitudDate, { addSuffix: true });

        if (data.fecha_caducidad) {
          const fechaCaducidadDate = data.fecha_caducidad.toDate();
          data.fecha_caducidad_format = format(fechaCaducidadDate, 'dd/MM/yyyy');
        }

        return data;
      });

      const projectData = await Promise.all(projectPromises);
      setProjects(projectData);

      // Guardar el último documento visible de esta página
      const newPageBounds = [...pageBounds];
      newPageBounds[page - 1] = querySnapshot.docs[querySnapshot.docs.length - 1];
      setPageBounds(newPageBounds);

      // Calcular el total de páginas
      if (page === 1) {
        const totalCount = await db.collection('proyecto')
          .where('estado_proyecto', '==', 'Fondeo')
          .get()
          .then(snapshot => snapshot.size);
        setTotalPages(Math.ceil(totalCount / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleViewMore = (project) => {
    setSelectedProject(project);
    setModalVisible(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      {projects.map((project, index) => (
        <Box key={index} sx={{ paddingY: '3vh' }}>
          <CardFinance
            imageSrc={project.imagen_solicitud}
            projectTitle={project.titulo}
            companyName={project.empresa}
            completedProjects={project.estado_proyecto}
            location={project.ubicacion}
            duration={project.timeAgo}
            amountRaised={project.monto_recaudado}
            goalamount={project.monto_pedido}
            percentageRaised={parseFloat(((project.monto_recaudado / project.monto_pedido) * 100).toFixed(2))}
            tokenYield={`${project.rendimiento} %`}
            tags={project.categoria}
            description={project.descripcion}
            fecha_cad={project.fecha_caducidad_format}
            onViewMore={() => handleViewMore(project)}
          />
        </Box>
      ))}
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          variant="outlined"
          color="primary"
        />
      </Box>
      {modalVisible && selectedProject && (
        <MaximizableDemo
          project={selectedProject}
          visible={modalVisible}
          onHide={() => setModalVisible(false)}
        />
      )}
    </Box>
  );
}

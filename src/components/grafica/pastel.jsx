"use client";
import { ResponsivePie } from '@nivo/pie';
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import { db } from '../../../firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";

const MyResponsivePie = () => {
    const [data, setData] = useState([]);
    const theme = useTheme();
    const containerRef = useRef(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const updateScreenSize = () => {
        const width = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;
        setIsSmallScreen(width < 600);
    };

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId');
            console.log("User ID:", userId);
            if (!userId) return;

            try {
                const investorDoc = await getDoc(doc(db, "inversor", userId));
                if (investorDoc.exists()) {
                    const investorData = investorDoc.data();
                    console.log("Investor Data:", investorData);

                    let categoryCount = {};

                    const processProjects = async (projects) => {
                        for (const key in projects) {
                            const contratoRef = projects[key];
                            const contratoDoc = await getDoc(contratoRef);

                            if (contratoDoc.exists()) {
                                const contratoData = contratoDoc.data();
                                const estado = contratoData.estado;

                                // if (estado === "Activo" || estado === "Finalizado") 
                                if (estado != 'Cancelado') 
                                {
                                    const proyectoRef = contratoData.id_proyecto;
                                    const proyectoDoc = await getDoc(proyectoRef);

                                    if (proyectoDoc.exists()) {
                                        const proyectoData = proyectoDoc.data();
                                        const categorias = proyectoData.categoria;

                                        for (const categoriaRef of categorias) {
                                            const categoriaDoc = await getDoc(categoriaRef);
                                            if (categoriaDoc.exists()) {
                                                const categoriaNombre = categoriaDoc.data().nombre;
                                                if (categoryCount[categoriaNombre]) {
                                                    categoryCount[categoriaNombre] += 1;
                                                } else {
                                                    categoryCount[categoriaNombre] = 1;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };

                    await processProjects(investorData.proyectos?.finalizados || {});
                    await processProjects(investorData.proyectos?.progreso || {});

                    console.log("Category Count:", categoryCount);

                    const formattedData = Object.keys(categoryCount).map(categoria => ({
                        id: categoria,
                        label: categoria,
                        value: categoryCount[categoria],
                        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
                    }));

                    // Si no hay categorías de proyectos, agregamos "Sin proyectos"
                    if (formattedData.length === 0) {
                        formattedData.push({
                            id: 'sin proyectos',
                            label: 'Sin proyectos',
                            value: 1,
                            color: '#cccccc'
                        });
                    }

                    setData(formattedData);
                } else {
                    console.warn("Investor document does not exist for user:", userId);
                    // Si no existe el documento, agregamos "Sin proyectos"
                    setData([{
                        id: 'sin proyectos',
                        label: 'Sin proyectos',
                        value: 1,
                        color: '#cccccc'
                    }]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                // En caso de error, agregamos "Sin proyectos"
                setData([{
                    id: 'sin proyectos',
                    label: 'Sin proyectos',
                    value: 1,
                    color: '#cccccc'
                }]);
            }
        };

        fetchData();
        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    const textColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    const tooltipBackgroundColor = theme.palette.mode === 'dark' ? '#333333' : '#FFFFFF';
    const tooltipTextColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';

    return (
        <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: '400px' }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                Investment Distribution by Category
            </Typography>
            <ResponsivePie
                data={data}
                margin={{ top: 40, right: 150, bottom: 80, left: 90 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeInnerRadiusOffset={8}
                activeOuterRadiusOffset={16}
                colors={{ scheme: 'category10' }}
                borderWidth={1}
                borderColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            '0.2'
                        ]
                    ]
                }}
                arcLinkLabelsTextOffset={5}
                arcLinkLabelsTextColor={textColor}
                arcLinkLabelsDiagonalLength={13}
                arcLinkLabelsStraightLength={9}
                arcLinkLabelsThickness={3}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={textColor}
                legends={[
                    {
                        anchor: 'right',
                        direction: 'column',
                        justify: false,
                        translateX: 140,
                        translateY: 0,
                        itemsSpacing: 5,
                        itemWidth: 100,
                        itemHeight: 18,
                        itemTextColor: textColor,
                        itemDirection: 'left-to-right',
                        itemOpacity: 1,
                        symbolSize: 18,
                        symbolShape: 'circle',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemTextColor: '#999'
                                }
                            }
                        ]
                    }
                ]}
                theme={{
                    labels: {
                        text: {
                            fontSize: 12,
                            fill: textColor
                        }
                    },
                    legends: {
                        text: {
                            fontSize: 14,
                            fill: textColor
                        }
                    },
                    tooltip: {
                        container: {
                            background: tooltipBackgroundColor,
                            color: tooltipTextColor,
                            fontSize: 'inherit',
                            borderRadius: '2px',
                            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                            padding: '5px 9px',
                        },
                    },
                }}
            />
        </div>
    );
};

export default MyResponsivePie;

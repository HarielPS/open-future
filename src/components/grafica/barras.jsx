"use client"
import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { Typography, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from '../../../firebase';

// Crear una escala de colores usando d3
const colorScale = scaleOrdinal(schemeCategory10);

const MyResponsiveBar = () => {
    const [year, setYear] = useState('');
    const [yearsAvailable, setYearsAvailable] = useState([]);
    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);
    const theme = useTheme();
    const textColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    const tooltipBackgroundColor = theme.palette.mode === 'dark' ? '#333333' : '#FFFFFF';
    const tooltipTextColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId');
            // console.log("User ID:", userId);
            if (!userId) return;

            try {
                const investorDoc = await getDoc(doc(db, "inversor", userId));
                if (investorDoc.exists()) {
                    const investorData = investorDoc.data();
                    // console.log("Investor Data:", investorData);

                    let chartData = {};
                    let earliestYear = currentYear;
                    let latestYear = currentYear;

                    const processContracts = async (projects) => {
                        for (const key in projects) {
                            // console.log("Processing Project:", key);
                            const contratoRef = projects[key];
                            const contratoDoc = await getDoc(contratoRef);

                            if (contratoDoc.exists()) {
                                const contratoData = contratoDoc.data();
                                // console.log("Contract Data:", contratoData);
                                const fechaContrato = contratoData.fecha_contrato.toDate();
                                const duracionContrato = parseInt(contratoData.duracion_contrato);
                                const estado = contratoData.estado;

                                const startMonth = fechaContrato.getMonth() + 1;
                                const startYear = fechaContrato.getFullYear();

                                if (startYear < earliestYear) earliestYear = startYear;
                                if (startYear + Math.floor(duracionContrato / 12) > latestYear) latestYear = startYear + Math.floor(duracionContrato / 12);

                                for (let i = 0; i < duracionContrato; i++) {
                                    const currentMonthLoop = ((startMonth + i - 1) % 12) + 1;
                                    const currentYearLoop = startYear + Math.floor((startMonth + i - 1) / 12);

                                    // console.log(`Processing month ${currentMonthLoop}, year ${currentYearLoop}`);

                                    if (!chartData[currentYearLoop]) chartData[currentYearLoop] = {};

                                    if (currentYearLoop <= currentYear && (currentYearLoop < currentYear || currentMonthLoop <= currentMonth)) {
                                        if (!chartData[currentYearLoop][currentMonthLoop]) {
                                            chartData[currentYearLoop][currentMonthLoop] = {
                                                month: new Date(currentYearLoop, currentMonthLoop - 1).toLocaleString('default', { month: 'long' }),
                                                cancelled: 0,
                                                completed: 0,
                                                active: 0,
                                                funding: 0
                                            };
                                        }

                                        if (estado === 'Cancelado' && i === 0) {
                                            chartData[currentYearLoop][currentMonthLoop].cancelled += 1;
                                            // console.log(`Cancelled project added to month ${currentMonthLoop}`);
                                            break;
                                        } else if (estado === 'Fondeo' && i === 0) {
                                            chartData[currentYearLoop][currentMonthLoop].funding += 1;
                                            // console.log(`Funding project added to month ${currentMonthLoop}`);
                                            break;
                                        } else if (estado === 'Finalizado') {
                                            if (i < duracionContrato - 1) {
                                                chartData[currentYearLoop][currentMonthLoop].active += 1;
                                            } else {
                                                chartData[currentYearLoop][currentMonthLoop].completed += 1;
                                            }
                                            // console.log(`Finalized project processed for month ${currentMonthLoop}`);
                                        } else if (estado === 'Activo') {
                                            chartData[currentYearLoop][currentMonthLoop].active += 1;
                                            // console.log(`Active project added to month ${currentMonthLoop}`);
                                        }
                                    }
                                }
                            } else {
                                console.warn("Contract not found for project:", key);
                            }
                        }
                    };

                    await processContracts(investorData.proyectos?.finalizados || {});
                    await processContracts(investorData.proyectos?.progreso || {});

                    // console.log("Processed Chart Data before conversion:", chartData);

                    // Limitar los años disponibles hasta el año actual
                    setYearsAvailable(Array.from({ length: latestYear - earliestYear + 1 }, (_, i) => earliestYear + i).filter(y => y <= currentYear));
                    if (year === '') setYear(currentYear.toString()); // Establecer el año actual como predeterminado

                    const chartDataArray = year in chartData ? Object.values(chartData[year]) : [];
                    chartDataArray.sort((a, b) => {
                        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                        return months.indexOf(a.month) - months.indexOf(b.month);
                    });
                    console.log("Final Chart Data Array:", chartDataArray);
                    setData(chartDataArray.length ? chartDataArray : null);
                } else {
                    console.warn("Investor document does not exist for user:", userId);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [year]);

    const handleChange = (event) => {
        setYear(event.target.value);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <div style={{ height: '100%', width: '100%', paddingBottom: 40 }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                Monthly Investment Projects ({year})
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="select-year-label">Year</InputLabel>
                <Select
                    labelId="select-year-label"
                    id="select-year"
                    open={open}
                    onClose={handleClose}
                    onOpen={handleOpen}
                    value={year}
                    label="Year"
                    onChange={handleChange}
                >
                    {yearsAvailable.map(y => (
                        <MenuItem key={y} value={y}>{y}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            {data ? (
                <ResponsiveBar
                    data={data}
                    keys={['cancelled', 'completed', 'active', 'funding']}
                    indexBy="month"
                    margin={{ top: 50, right: 130, bottom: 90, left: 60 }}
                    padding={0.3}
                    groupMode="stacked"
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={({ id, data }) => colorScale(id)}
                    borderColor={{
                        from: 'color',
                        modifiers: [['darker', 1.6]]
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: -90, // Rotar los ticks para mostrar los meses en vertical
                        legend: 'month',
                        legendPosition: 'middle',
                        legendOffset: 32,
                        tickColor: textColor,
                        legendTextColor: textColor,
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'projects',
                        legendPosition: 'middle',
                        legendOffset: -40,
                        tickColor: textColor,
                        legendTextColor: textColor,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={textColor}
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 120,
                            translateY: 20, // Desplazar la leyenda hacia abajo para evitar que se encime con los meses
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 20,
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                    role="application"
                    ariaLabel="Nivo bar chart demo"
                    barAriaLabel={e => e.id + ": " + e.formattedValue + " in month: " + e.indexValue}
                    theme={{
                        axis: {
                            ticks: {
                                text: {
                                    fill: textColor
                                }
                            },
                            legend: {
                                text: {
                                    fill: textColor
                                }
                            }
                        },
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
            ) : (
                <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: textColor }}>
                    No data available for {year}.
                </Typography>
            )}
        </div>
    );
};

export default MyResponsiveBar;

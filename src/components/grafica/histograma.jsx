"use client";
import { ResponsiveLine } from '@nivo/line';
import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { db } from '../../../firebase';

const MyResponsiveLine = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear.toString());
    const [yearsAvailable, setYearsAvailable] = useState([currentYear]);
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const theme = useTheme();
    const textColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    const tooltipBackgroundColor = theme.palette.mode === 'dark' ? '#333333' : '#FFFFFF';
    const tooltipTextColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';

    useEffect(() => {
        const fetchData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            try {
                const investorDoc = await getDoc(doc(db, "inversor", userId));
                if (investorDoc.exists()) {
                    const investorData = investorDoc.data();
                    const pagos = investorData.pagos || {};

                    console.log("Pagos encontrados:", pagos);

                    const monthlyData = Array(12).fill().map((_, index) => ({
                        month: new Date(0, index).toLocaleString('default', { month: 'long' }),
                        investment: 0,
                        earnings: 0
                    }));

                    let uniqueYears = new Set();

                    for (const key in pagos) {
                        const pago = pagos[key];
                        console.log(`Procesando pago: ${key}`, pago);

                        const contratoRef = pago.id_contrato;
                        const contratoDoc = await getDoc(contratoRef);

                        if (contratoDoc.exists()) {
                            const contratoData = contratoDoc.data();
                            console.log(`Contrato: ${contratoRef.id}`, contratoData);

                            if ((contratoData.estado === "Activo" || contratoData.estado === "Finalizado") && pago.estado === "pagado") {
                                const fecha = pago.fecha.toDate();
                                const pagoYear = fecha.getFullYear();
                                const pagoMonth = fecha.getMonth(); // 0 = January, 11 = December

                                uniqueYears.add(pagoYear);

                                if (pagoYear === parseInt(year)) {
                                    if (pago.tipo === "salida") {
                                        monthlyData[pagoMonth].investment += pago.monto;
                                    } else if (pago.tipo === "entrada") {
                                        monthlyData[pagoMonth].earnings += pago.monto;
                                    }
                                }
                            }
                        } else {
                            console.warn(`No se encontró contrato para la referencia: ${contratoRef.id}`);
                        }
                    }

                    const finalData = [
                        {
                            id: "investment",
                            color: "hsl(201, 70%, 50%)",
                            data: monthlyData.map((d) => ({ x: d.month, y: d.investment }))
                        },
                        {
                            id: "earnings",
                            color: "hsl(318, 70%, 50%)",
                            data: monthlyData.map((d) => ({ x: d.month, y: d.earnings }))
                        },
                        {
                            id: "total_repayment",
                            color: "hsl(36, 70%, 50%)",
                            data: monthlyData.map((d) => ({ x: d.month, y: (d.investment + d.earnings) / 2 }))
                        }
                    ];

                    setYearsAvailable(Array.from(uniqueYears).sort((a, b) => a - b));
                    setData(finalData);
                    console.log("Datos procesados:", finalData);
                } else {
                    console.warn("No se encontró documento de inversor para el usuario:", userId);
                }
            } catch (error) {
                console.error("Error obteniendo los datos:", error);
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
                Investment and Earnings Over Time ({year})
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
                        <MenuItem key={y} value={y.toString()}>{y}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <ResponsiveLine
                data={data}
                margin={{ top: 10, right: 150, bottom: 50, left: 80 }}
                xScale={{ type: 'point' }}
                yScale={{
                    type: 'linear',
                    min: 0,
                    max: 'auto',
                    stacked: true,
                    reverse: false
                }}
                curve="linear"
                yFormat=" >-.2f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Time (months)',
                    legendOffset: 40,
                    legendPosition: 'middle'
                }}
                axisLeft={{
                    tickSize: 10,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Amount ($)',
                    legendOffset: -70,
                    legendPosition: 'middle'
                }}
                enableGridX={false}
                colors={{ scheme: 'set1' }}
                lineWidth={3}
                pointSize={10}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabel="data.yFormatted"
                pointLabelYOffset={-12}
                enableArea={true}
                areaBlendMode="normal"
                areaBaselineValue={0}
                areaOpacity={0.25}
                useMesh={true}
                enableSlices="x"
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 110,
                        translateY: 0,
                        itemTextColor: textColor,
                        itemsSpacing: 0,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemBackground: 'rgba(0, 0, 0, .03)',
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
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
                    grid: {
                        line: {
                            stroke: textColor 
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
                isInteractive={true}
                enableZoomPan={true}
            />
        </div>
    );
};

export default MyResponsiveLine;

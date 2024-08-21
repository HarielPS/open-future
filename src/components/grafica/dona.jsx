"use client";
import { ResponsivePie } from '@nivo/pie';
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';

const MyResponsivePieAdjusted = ({ data }) => {
    const theme = useTheme();
    const containerRef = useRef(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    const updateScreenSize = () => {
        const width = containerRef.current ? containerRef.current.offsetWidth : window.innerWidth;
        setIsSmallScreen(width < 1024);
    };

    useEffect(() => {
        console.log(data);
        updateScreenSize();
        window.addEventListener('resize', updateScreenSize);
        return () => window.removeEventListener('resize', updateScreenSize);
    }, []);

    const textColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';
    const tooltipBackgroundColor = theme.palette.mode === 'dark' ? '#333333' : '#FFFFFF';
    const tooltipTextColor = theme.palette.mode === 'dark' ? '#FFFFFF' : '#000000';

    return (
        <div ref={containerRef} style={{ height: '90%', width: '90%'}}>
            <ResponsivePie
                data={data}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeInnerRadiusOffset={8}
                activeOuterRadiusOffset={isSmallScreen ? 0 : 16}
                colors={{ scheme: 'dark2' }}
                borderWidth={1}
                borderColor={{
                    from: 'color',
                    modifiers: [
                        [
                            'darker',
                            '0'
                        ]
                    ]
                }}
                arcLinkLabelsSkipAngle={360}
                arcLinkLabelsTextOffset={0}
                arcLinkLabelsTextColor="none"
                arcLinkLabelsDiagonalLength={0}
                arcLinkLabelsStraightLength={0}
                arcLinkLabelsThickness={0}
                arcLinkLabelsColor="none"
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={textColor}
                legends={[
                    {
                        anchor: 'bottom',
                        direction: 'column',
                        justify: false,
                        translateX: 200,
                        translateY: -20,
                        itemsSpacing: 6,
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

export default MyResponsivePieAdjusted;

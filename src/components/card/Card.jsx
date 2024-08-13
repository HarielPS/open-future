"use client";
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Image } from 'primereact/image';
import { Box } from '@mui/system';
import TrendingUpIcon from '@mui/icons-material/TrendingUp'; 
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerOffIcon from '@mui/icons-material/TimerOff';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import getColor from '@/themes/colorUtils';
import ProgressBarWithLabel from '../loading/porcentaje';

export default function CardFinance({
  imageSrc,
  projectTitle,
  companyName,
  completedProjects,
  location,
  duration,
  amountRaised,
  goalamount,
  percentageRaised,
  tokenYield,
  tags,
  description,
  fecha_cad,
  onViewMore // Add onViewMore prop
}) {
  const theme = useTheme();
  const borderColor = theme.palette.mode === 'dark' ? '#CFCFCF' : '#B2B2B2';
  const boxShadow = theme.palette.mode === 'dark' ? '0 4px 8px rgba(255, 255, 255, 0.2)' : '0 4px 8px rgba(0, 0, 0, 0.2)';

  return (
    <Card sx={{ background: getColor(theme, 'third') , border: `1px solid ${borderColor}`, borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow, padding: '20px' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '75%' }}>
          <Box sx={{ border: `1px solid ${borderColor}`, borderRadius: '10%', overflow: 'hidden', width: '200px', height: '200px', boxShadow }}>
            <Image 
              src={imageSrc} 
              alt={`${companyName} Logo`} 
              width={200} 
              height={200} 
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', paddingLeft: '5%', }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', }}>
              {projectTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', marginTop: '2vh' }}>
              <AccountCircleIcon sx={{ marginRight: '10px' }} />
              <span style={{ fontWeight: 'bold' }}>{companyName}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', marginTop: '2vh' }}>
              <EventNoteIcon sx={{ marginRight: '10px' }} />
              <span style={{ fontWeight: 'bold' }}>{completedProjects} Proyectos completados</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', marginTop: '1vh' }}>
              <LocationOnIcon sx={{ marginRight: '10px' }} />
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {location}
              </span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', marginTop: '1vh' }}>
              <ScheduleIcon sx={{ marginRight: '10px' }} />
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {duration && typeof duration === 'object' ? duration.toString() : duration}
              </span>
              <span sx={{ marginX: '10px' }}>-</span>
              <TimerOffIcon sx={{ marginRight: '8px' }} />
              <span style={{ display: 'flex', alignItems: 'center' }}>
                Solicitud valida hasta: {fecha_cad && typeof fecha_cad === 'object' ? fecha_cad.toString() : fecha_cad}
              </span>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', width: '25%', paddingRight: '5vh', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', marginRight: '5px' }} >
              Meta: 
            </Typography>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
              ${goalamount}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '1vh' }}>
            <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontWeight: 'bold', marginRight: '5px' }} >
              Recaudado: 
            </Typography>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold', textAlign: 'right' }}>
              ${amountRaised}
            </Typography>
          </Box>
          <Box sx={{ marginTop: '1vh' }}>
            <ProgressBarWithLabel progress={percentageRaised} />
          </Box>
          <Chip icon={<TrendingUpIcon sx={{color: theme.palette.text.primary}}/>} label={`Rendimiento: ${tokenYield}`} sx={{background:getColor(theme,'fifth')}}/>      
        </Box>
      </Box>

      <CardContent>
        <Box sx={{ marginTop: '16px' }}>
          {tags.map((tag, index) => (
            <Chip key={index} label={tag} variant="outlined" sx={{ margin: '2px', border: '1px solid #E0E0E0' }} />
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ marginTop: '16px' }}>
          {description}
        </Typography>
      </CardContent>

      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end', marginRight: '30px', marginBottom: '30px' }}>
        <Button variant="contained" color="primary" sx={{ borderRadius: '8px', boxShadow }} onClick={onViewMore}>
          Ver más
        </Button>
      </CardActions>
    </Card>
  );
}

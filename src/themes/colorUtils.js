// colorUtils.js
import { useTheme } from '@mui/material/styles';

const getColor = (theme, colorName) => {
  const customColors = {
    shadow: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    third: theme.palette.mode === 'dark' ? '#929292' : '#ECECEC', // si es oscuro: gris fuerte , si es light gris-blanquesino
    fourth: theme.palette.mode === 'dark' ? '#444444' : '#FFCC00', // dark : gris casi negro , light: amarillo
    fifth: theme.palette.mode === 'dark' ? '#333333' : '#ffffff', // dark: gris - muy negro, light: blanco
    fifth_rev: theme.palette.mode === 'dark' ? '#121212' : '#ffffff', // dark: negro no muy negro , light:blanco
    six: theme.palette.mode === 'dark' ? '#333333' : '#ebebeb', //dark: gris - muy negro, light: blanco-gris
    seven: theme.palette.mode === 'dark' ? '#434343' : '#f5f5f5', // gris-negro , light: gris blanco
    head: theme.palette.mode === 'dark' ? '#121212' : '#eaeaea', //

    // Agregar más colores personalizados aquí
  };

  return customColors[colorName] || theme.palette.background.paper;
};

export default getColor;

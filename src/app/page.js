"use client";
import * as React from 'react';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '../themes/ThemeContext'; // Asegúrate de que la ruta sea correcta
import AppAppBar from '../component/landing/AppAppBar';
import Hero from '@/component/landing/Hero';
import Highlights from '@/component/landing/Highlights';
import HighlightSection from '@/component/landing/Pricing';
import Features from '@/component/landing/Features';
import Testimonials from '@/component/landing/Testimonials';
import FAQ from '@/component/landing/FAQ';
import Footer from '@/component/landing/Footer';
import { ThemeProvider } from '@emotion/react';

export default function LandingPage() {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppAppBar />
      <Hero />
      <Box sx={{ bgcolor: 'background.default' }}>
        <Features />
        <Divider />
        <Testimonials />
        <Divider />
        <HighlightSection />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

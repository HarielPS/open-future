"use client";
import React, { useState } from 'react';
import { Box, Typography, Stack, useTheme, Button } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import WalletConnect from '@/component/web3/wallet/WalletConnect';
import ThemeToggle from "../ThemeToggle";
import { db } from '../../../firebase';
import { doc, getDoc, collection } from 'firebase/firestore';
import comprobarCuenta from '@/component/searchBD/comprobarcuenta';
import WalletDisconnect, { clearLocalStorage } from '@/component/web3/wallet/WalletDisconnect';
import PasswordModal from './password/modal';

const Registro = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [userId, setUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleWalletConnected = async (walletName, walletAddress) => {
    try {
      console.log('Wallet Connected:', { walletName, walletAddress });
      const result = await comprobarCuenta();

      if (result) {
        console.log('Wallet found');
        const userId = localStorage.getItem('userId');

        console.log(`Se encontro wallet en ${userId}`);
        console.log(`Wallet ${walletName} with address ${walletAddress}.`);
        
        setModalOpen(true); // Open the password modal
      } else {
        alert('Usuario no registrado');
        clearLocalStorage();
        console.log('Usuario no registrado');
      }
    } catch (error) {
      console.error('Error saving wallet to Firebase:', error);
    }
  };

  const handlePasswordSubmit = async (password) => {
    console.log('Password submitted:', password);  // Log the password submission
    try {
      const userId = localStorage.getItem('userId');
      const userDocRef = doc(db, 'inversor', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.password === password) {
          console.log('Password is correct');  // Log correct password
          window.location.href = '/user/dashboard/inicio';
        } else {
          console.log('Invalid password');  // Log invalid password
          setPasswordError('Invalid password');
        }
      } else {
        console.log('User not found');  // Log user not found
        setPasswordError('User not found');
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      setPasswordError('Error verifying password');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: isDarkMode ? 'background.default' : '#f0f4f8',
        overflow: 'hidden',
        padding: 2,
        boxSizing: 'border-box',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16
        }}
      >
        <Button
          variant="extended"
          onClick={() => window.location.href = '/'}
          sx={{
            boxShadow: isDarkMode
              ? '0px 3px 5px -1px rgba(255, 255, 255, 0.2), 0px 6px 10px 0px rgba(255, 255, 255, 0.14), 0px 1px 18px 0px rgba(255, 255, 255, 0.12)'
              : '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
          }}
        >
          <NavigationIcon sx={{ mr: 1, transform: 'rotate(-90deg)' }} />
          Atras
        </Button>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16
        }}
      >
        <ThemeToggle />
      </Stack>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          mb: 4,
          textAlign: 'center',
          color: isDarkMode ? theme.palette.text.primary : '#333'
        }}
      >
        Iniciar Sesion
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '90%',
          maxWidth: '800px',
          bgcolor: 'background.paper',
          boxShadow: isDarkMode
            ? '0px 3px 5px -1px rgba(255, 255, 255, 0.2), 0px 6px 10px 0px rgba(255, 255, 255, 0.14), 0px 1px 18px 0px rgba(255, 255, 255, 0.12)'
            : '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
          borderRadius: 2,
          padding: 4,
          textAlign: 'center',
        }}
      >
        <WalletConnect onWalletConnected={handleWalletConnected} />
      </Box>
      <PasswordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handlePasswordSubmit}
        error={passwordError}  // Pass the passwordError as the error prop
      />
    </Box>
  );
};

export default Registro;

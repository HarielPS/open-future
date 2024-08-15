"use client";
import React, { useState } from 'react';
import { Box, Typography, Stack, useTheme, Button, ButtonGroup } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import WalletConnect from '@/component/web3/wallet/WalletConnect';
import ThemeToggle from "../ThemeToggle";
import { db } from '../../../firebase';
import { doc, addDoc, collection } from 'firebase/firestore';
import comprobarCuenta from '@/component/searchBD/comprobarcuenta';
import WalletDisconnect, { clearLocalStorage } from '@/component/web3/wallet/WalletDisconnect';

const Registro = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [userId, setUserId] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Inversor'); // Estado para manejar el rol seleccionado

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', role);
  };

  const handleWalletConnected = async (walletName, walletAddress) => {
    try {
      console.log('Wallet Connected:', { walletName, walletAddress });
      const result = await comprobarCuenta();

      if (!result) {
        console.log('Wallet not found, creating new user...');
        
        // Decidir la colección según el rol seleccionado
        const collectionName = selectedRole === 'Inversor' ? 'inversor' : 'empresa';
        const userCollectionRef = collection(db, collectionName);
        
        // Crear un nuevo documento en la colección correspondiente
        const userDocRef = await addDoc(userCollectionRef, {
          wallet: {
            [walletName]: { 1: walletAddress } // Almacena la wallet con un identificador numérico
          }
        });

        localStorage.setItem('userId', userDocRef.id);
        setUserId(userDocRef.id);

        console.log(`New ${selectedRole} created with ID: ${userDocRef.id}`);
        
        // Redirigir a la página correspondiente según el rol
        const redirectUrl = selectedRole === 'Inversor' ? '/registro/datos' : '/registro/empresa';
        window.location.href = redirectUrl;
      } else {
        alert('Usuario ya registrado');
        clearLocalStorage();
        console.log('Usuario ya registrado');
      }
    } catch (error) {
      console.error('Error saving wallet to Firebase:', error);
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
        Registro ({selectedRole})
      </Typography>

      {/* Role Selection Buttons */}
      <ButtonGroup
        disableElevation
        variant="contained"
        aria-label="role selection button group"
        sx={{ mb: 4 }}
      >
        <Button
          onClick={() => handleRoleChange('Inversor')}
          disabled={selectedRole === 'Inversor'}
        >
          Inversor
        </Button>
        <Button
          onClick={() => handleRoleChange('Empresa')}
          disabled={selectedRole === 'Empresa'}
        >
          Empresa
        </Button>
      </ButtonGroup>

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
    </Box>
  );
};

export default Registro;

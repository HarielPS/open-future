"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, useTheme, Button, ButtonGroup } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import WalletConnect from '@/component/web3/wallet/WalletConnect';
import ThemeToggle from "../ThemeToggle";
import { db } from '../../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import comprobarCuenta from '@/component/searchBD/comprobarcuenta';
import WalletDisconnect, { clearLocalStorage } from '@/component/web3/wallet/WalletDisconnect';
import PasswordModal from './password/modal';

const Registro = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [userId, setUserId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [selectedRole, setSelectedRole] = useState('Inversor'); // Estado para manejar el rol seleccionado

  useEffect(() => {
    localStorage.setItem('selectedRole', 'Inversor'); // Guarda el rol en el localStorage
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    localStorage.setItem('selectedRole', role); // Guarda el rol en el localStorage
    console.log(`Rol seleccionado: ${role}`);
  };
  

  const handleWalletConnected = async (walletName, walletAddress) => {
    try {
      console.log('Wallet Connected:', { walletName, walletAddress });
  
      // Verifica si el rol está guardado en el localStorage
      const selectedRole = localStorage.getItem('selectedRole');
      if (!selectedRole) {
        console.log('No se seleccionó ningún rol.');
        alert('Por favor, selecciona un rol antes de continuar.');
        return;
      }
  
      const result = await comprobarCuenta();
  
      if (result) {
        console.log('Wallet found');
        const userId = localStorage.getItem('userId');
        console.log(`Se encontró wallet en ${userId}`);
        console.log(`Wallet ${walletName} con dirección ${walletAddress}.`);
        
        setModalOpen(true); // Abre el modal de contraseña
      } else {
        alert('Usuario no registrado');
        clearLocalStorage();
        console.log('Usuario no registrado');
      }
    } catch (error) {
      console.error('Error al conectar la wallet:', error);
    }
  };
  

  const handlePasswordSubmit = async (password) => {
    console.log('Password submitted:', password);  // Log the password submission
    try {
      const userId = localStorage.getItem('userId');
      const collectionName = selectedRole === 'Inversor' ? 'inversor' : 'empresa';
      const userDocRef = doc(db, collectionName, userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.password === password) {
          console.log('Password is correct');  // Log correct password
          const redirectUrl = selectedRole === 'Inversor' ? '/user/dashboard/inicio' : '/user/empresa/inicio';
          window.location.href = redirectUrl;
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
        Iniciar Sesion ({selectedRole})
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

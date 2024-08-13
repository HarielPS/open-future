"use client";
import React, { useState } from 'react';
import { Box, Typography, Stack, useTheme, Button } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import WalletConnect from '@/component/web3/wallet/WalletConnect';
import ThemeToggle from "../ThemeToggle";
import { db } from '../../../firebase';
import { doc, addDoc, updateDoc, getDoc, collection } from 'firebase/firestore';
import comprobarCuenta from '@/component/searchBD/comprobarcuenta';
import WalletDisconnect, { clearLocalStorage } from '@/component/web3/wallet/WalletDisconnect';

const Registro = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [userId, setUserId] = useState(null);

  const handleWalletConnected = async (walletName, walletAddress) => {
    try {
      console.log('Wallet Connected:', { walletName, walletAddress });
      let userDocRef;
      let walletNumber = 1;
      const result = await comprobarCuenta();

      if (!result) {
        console.log('Wallet not found, creating new user...');
        
        const userCollectionRef = collection(db, 'inversor');
        userDocRef = await addDoc(userCollectionRef, {
          wallet: {
            [walletName]: { [walletNumber]: walletAddress }
          }
        });

        localStorage.setItem('userId', userDocRef.id);
        setUserId(userDocRef.id);

        console.log(`New user created with ID: ${userDocRef.id}`);

        // userDocRef = doc(db, 'inversor', userDocRef.id);

        // const userDoc = await getDoc(userDocRef);
        // if (userDoc.exists() && userDoc.data().wallet && userDoc.data().wallet[walletName]) {
        //   const existingWallets = userDoc.data().wallet[walletName];
        //   walletNumber = Object.keys(existingWallets).length + 1;
        // }

        // await updateDoc(userDocRef, {
        //   [`wallet.${walletName}.${walletNumber}`]: walletAddress
        // });

        console.log(`Wallet ${walletName} with address ${walletAddress} saved to Firebase.`);
        window.location.href = '/registro/datos';
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
          onClick={()=>window.location.href = '/'}
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
        Registro
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
    </Box>
  );
};

export default Registro;

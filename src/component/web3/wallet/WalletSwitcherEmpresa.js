"use client";
import React from "react";
import { Box, Typography } from '@mui/material';
import WalletConnect from '@/component/web3/wallet/WalletConnect'; // Ajustar la ruta de importación si es necesario
import { db } from '../../../../firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import comprobarCuentaSwitch from "@/component/searchBD/ComprobarCuentaSwitchEmpresa";
import {clearLocalStorage_exID } from "./WalletDisconnect";

const WalletSwitcher = ({ setWalletAddress, setWalletBalance }) => {
  const userId = localStorage.getItem('userId');

  const handleWalletConnected = async (walletName, walletAddress) => {
    try {
      const userDocRef = doc(db, 'empresa', userId);
      const userDoc = await getDoc(userDocRef);
      let walletNumber = 1;
      const result = await comprobarCuentaSwitch();
      console.log(result);

      if(result!='usuario no tiene wallet' && result!='No search')
      {
        
        if(result != 'usuario tiene wallet')
        {
          // alert('wallet guardada en tu perfil');
          if (userDoc.exists() && userDoc.data().wallet && userDoc.data().wallet[walletName]) {
            const existingWallets = userDoc.data().wallet[walletName];
            walletNumber = Object.keys(existingWallets).length + 1;
          }
          console.log("wallet guardada");
          await updateDoc(userDocRef, {
            [`wallet.${walletName}.${walletNumber}`]: walletAddress
          });
        }
        // alert('se conecto');
        console.log(`Wallet ${walletName} with address ${walletAddress} saved to Firebase.`);
        window.location.href = "/user/empresa/inicio";
      } else {
        alert('Wallet registrada con otro Usuario');
        clearLocalStorage_exID();
        console.log('Wallet registrada con otro Usuario');
      }
    } catch (error) {
      alert('No se realizo ninguna conexion');
      clearLocalStorage_exID();
      console.error('No se realizo ninguna conexion', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="h6">Wallet Management</Typography>
      <WalletConnect onWalletConnected={handleWalletConnected} />
    </Box>
  );
};

export default WalletSwitcher;

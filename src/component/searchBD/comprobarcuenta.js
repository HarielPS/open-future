"use client";
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
// import { clearLocalStorage } from '../web3/wallet/WalletDisconnect';

/**
 * Comprueba si una wallet ya está registrada en la colección de inversores.
 * 
 * @returns {Promise<boolean>} - Devuelve true si la wallet está registrada, de lo contrario false.
 */
const comprobarCuenta = async () => {
  console.log('Executing comprobarCuenta...');
  try {
    const walletAddress = localStorage.getItem('connectedWalletAddress');
    const walletName = localStorage.getItem('connectedWalletName');

    if (!walletAddress || !walletName) {
      console.log('No se encontraron los datos de la wallet en el almacenamiento local.');
      return false;
    }

    const inversoresCollectionRef = collection(db, 'inversor');
    const querySnapshot = await getDocs(inversoresCollectionRef);

    let found = false;
    let userId = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.wallet && data.wallet[walletName]) {
        const wallets = data.wallet[walletName];
        for (const key in wallets) {
          if (wallets[key] === walletAddress) {
            found = true;
            userId = doc.id;
            localStorage.setItem('userId', userId);
            break;
          }
        }
      }
    });

    if (found) {
      console.log('Wallet encontrada');
    //   clearLocalStorage();
      return true;
    } else {
      console.log('Wallet no encontrada');
      return false;
    }
  } catch (error) {
    console.error('Error comprobando la cuenta:', error);
    return false;
  }
};

export default comprobarCuenta;

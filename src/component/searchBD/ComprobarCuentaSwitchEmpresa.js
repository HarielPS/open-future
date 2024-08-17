"use client";
import { db } from '../../../firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

const comprobarCuentaSwitch = async () => {
  console.log('Executing comprobarCuenta...');
  try {
    const walletAddress = localStorage.getItem('connectedWalletAddress');
    const walletName = localStorage.getItem('connectedWalletName');
    const userId_storage = localStorage.getItem('userId');

    if (!walletAddress || !walletName) {
      console.log('No se encontraron los datos de la wallet en el almacenamiento local.');
      return 'No search';
    }

    const inversoresCollectionRef = collection(db, 'empresa');
    const querySnapshot = await getDocs(inversoresCollectionRef);

    let found = false;
    let registeredUserId = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.wallet && data.wallet[walletName]) {
        const wallets = data.wallet[walletName];
        for (const key in wallets) {
          if (wallets[key] === walletAddress) {
            found = true;
            registeredUserId = doc.id; // Guardar el ID del usuario que tiene registrada la wallet
            break;
          }
        }
      }
    });

    if (found) {
      console.log('Wallet encontrada, comprobar si la usa el usuario...');
      if (registeredUserId === userId_storage) {
        console.log('La wallet está registrada a este usuario.');
        return 'usuario tiene wallet'; // La wallet está registrada al usuario actual
      } else {
        console.log('La wallet está registrada a otro usuario.');
        return 'usuario no tiene wallet'; // La wallet está registrada a otro usuario
      }
    } else {
      console.log('Wallet no encontrada, se registrará al usuario.');
      return 'wallet no registrada'; // La wallet no está registrada, se puede registrar al usuario actual
    }
  } catch (error) {
    console.error('Error comprobando la cuenta:', error);
    return 'No search';
  }
};

export default comprobarCuentaSwitch;

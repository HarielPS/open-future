"use client";
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const comprobarCuenta = async () => {
  console.log('Ejecutando comprobarCuenta...');
  try {
    const walletAddress = localStorage.getItem('connectedWalletAddress');
    const walletName = localStorage.getItem('connectedWalletName');
    const selectedRole = localStorage.getItem('selectedRole'); // Obtén el rol seleccionado

    if (!walletAddress || !walletName || !selectedRole) {
      console.log('No se encontraron los datos necesarios en el almacenamiento local.');
      return false;
    }

    // Decidir en qué colección buscar dependiendo del rol
    const collectionName = selectedRole === 'Inversor' ? 'inversor' : 'empresa';
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

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

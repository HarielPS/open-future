import React from 'react';
import Web3 from 'web3';
import { Button } from '@mui/material';

const PaymentProcessor = ({ amount, contrato, walletUser, walletEmpresa, onSuccess, onError }) => {
    const handlePayment = async () => {
        if (!window.ethereum) {
            alert('No Ethereum wallet found. Please install MetaMask.');
            return;
        }

        const web3 = new Web3(window.ethereum);

        try {
            const accounts = await web3.eth.getAccounts();
            const transaction = await web3.eth.sendTransaction({
                from: walletUser,
                to: walletEmpresa,
                value: web3.utils.toWei(amount.toString(), 'ether'),
                gas: 21000, // Ajustar si es necesario
            });

            onSuccess(transaction); // Llamar a la función de éxito cuando la transacción sea exitosa
        } catch (error) {
            console.error("Payment failed:", error);
            onError(error); // Llamar a la función de error cuando falle la transacción
        }
    };

    return (
        <Button label="Confirmar Pago" onClick={handlePayment} />
    );
};

export default PaymentProcessor;

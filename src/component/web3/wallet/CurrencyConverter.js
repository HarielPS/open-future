"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';

const CurrencyConverter = ({ amount, currency }) => {
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currency) return;
    console.log("Currency loaded:", currency);

    const fetchConversionRate = async () => {
      try {
        const url = `/api/component/coinmarketcap?convert=USD`;
        const response = await axios.get(url);
        console.log('API Response:', response.data);

        // Verificar la estructura de la respuesta
        if (response.data && response.data.data) {
          const currencyData = response.data.data.find(coin => coin.symbol === currency.toUpperCase());

          if (currencyData && currencyData.quote && currencyData.quote.USD) {
            const usdToSelectedCurrencyRate = currencyData.quote.USD.price;
            const converted = amount / usdToSelectedCurrencyRate;
            setConvertedAmount(converted);
          } else {
            throw new Error('Invalid response structure or missing currency data');
          }
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        console.error('Error fetching exchange rate:', err.message);
        setError('Failed to fetch exchange rate');
      }
    };

    fetchConversionRate();
  }, [amount, currency]);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Currency Conversion</Typography>
      {error ? (
        <Typography variant="body1" color="error">{error}</Typography>
      ) : (
        <Typography variant="body1">
          {amount} USD = {convertedAmount ? convertedAmount.toFixed(6) : '...'} {currency ? currency.toUpperCase() : ''}
        </Typography>
      )}
    </Box>
  );
};

export default CurrencyConverter;

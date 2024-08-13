"use client"
import React, { useEffect, useState } from 'react'
import { Button, Tooltip, Checkbox, TextField } from '@mui/material';

const page = () => {
  const [value, setValue] = useState('');
  const [formIsValid, setFormIsValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const validateForm = () => {
      if (value === '') {
        setFormIsValid(false);
        setErrorMessage('Please enter a value');
      } else if (parseInt(value) > 10) {
        setFormIsValid(false);
        setErrorMessage('Value cannot exceed 10');
      } else {
        setFormIsValid(true);
        setErrorMessage(null);
      }
    };
    validateForm();
  }, [value]);

  const handleTextChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <TextField
        label="Enter a value"
        value={value}
        onChange={handleTextChange}
      />
      <Tooltip title={errorMessage}>
        <span>
          <Button
            variant="contained"
            disabled={!formIsValid}
          >
            Enviar
          </Button>
        </span>
      </Tooltip>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
    </div>
  );
};

export default page;
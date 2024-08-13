import React, { useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Stack } from '@mui/material';

const PasswordModal = ({ open, onClose, onSubmit, error }) => {
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = () => {
    if (password.trim() === '') {
      setLocalError('Password is required');
    } else {
      setLocalError('');
      onSubmit(password);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          width: 300,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Enter Password
        </Typography>
        {(error || localError) && (
          <Typography color="error" variant="body2" gutterBottom>
            {error || localError}
          </Typography>
        )}
        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default PasswordModal;

import * as React from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const Loading = () => {
    return (
        <Box 
            sx={{
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden' 
            }}
        >
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
    );
}

export default Loading;

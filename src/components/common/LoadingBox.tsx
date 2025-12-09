import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingBoxProps {
  isLoading?: boolean;
}

function LoadingBox({ isLoading = false }: LoadingBoxProps) {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        width: '100%',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ color: '#7e7d7dff' }} />
      <Typography variant="h6" sx={{ color: '#666', mt: 2, fontWeight: 500 }}>
        {isLoading ? 'Loading data...' : 'Loading data... please wait.'}
      </Typography>
    </Box>
  );
}

export default LoadingBox;
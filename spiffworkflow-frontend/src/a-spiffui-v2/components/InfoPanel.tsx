import {
  Box,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { ReactNode } from 'react';

export default function InfoPanel({
  title,
  callback,
  children,
}: {
  title: string;
  callback: () => void;
  children: ReactNode;
}) {
  const isDark = useTheme().palette.mode === 'dark';

  const checkIsDark = () => {
    return isDark ? 'background.bluegreymedium' : 'background.bluegreydark';
  };

  return (
    <Box
      sx={{ width: '100%', height: '100%', resize: 'both', overflow: 'hidden' }}
    >
      <Paper
        elevation={10}
        sx={{
          width: '100%',
          height: '100%',
          border: '4px solid',
          borderColor: 'divider',
          borderRadius: 2,
          padding: 1,
        }}
      >
        <Stack sx={{ height: '100%', position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1500, // MUI top level
              width: '100%',
            }}
          >
            <Toolbar
              variant="regular"
              sx={{
                backgroundColor: checkIsDark(),
                borderRadius: 2,
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="close"
                onClick={() => callback()}
                sx={{
                  marginRight: 2,
                  backgroundColor: checkIsDark(),
                }}
              >
                <CancelOutlinedIcon />
              </IconButton>
              <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
                {title}
              </Typography>
            </Toolbar>
          </Box>
          <Box sx={{ position: 'relative', top: 55, height: '100%' }}>
            {children}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Container, CssBaseline, Divider, Grid } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import SideMenu from '../a-spiffui-v2/components/sidemenu/SideMenu';
import Dashboards from '../a-spiffui-v2/views/Dashboards/Dashboards';
import {
  globalThemeLight,
  globalThemeDark,
} from '../a-spiffui-v2/assets/theme/SpiffTheme';
import { MenuItemData } from '../a-spiffui-v2/components/sidemenu/MenuItem';

/**
 * This is the main entry point for the new SpiffUI V2.
 * It's a full screen app that will be rendered on top of the old SpiffUI.
 * To access, use the root domain (e.g. localhost:7001) and add"/newui"
 */
export default function SpiffUIV2() {
  const [globalTheme, setGlobalTheme] = useState(createTheme(globalThemeLight));
  useEffect(() => {
    /**
     * The housing app has an element with a white background
     * and a very high z-index. This is a hack to remove it.
     */
    const element = document.querySelector('.cds--white');
    if (element) {
      element.classList.remove('cds--white');
    }
  }, []);

  const handleMenuCallback = (data: MenuItemData) => {
    if (data.label === 'Dark Mode') {
      if (globalTheme.palette.mode === 'light') {
        setGlobalTheme(createTheme(globalThemeDark));
      } else {
        setGlobalTheme(createTheme(globalThemeLight));
      }
    }
  };

  return (
    <ThemeProvider theme={globalTheme}>
      <CssBaseline />
      <Container
        maxWidth={false}
        sx={{
          // Hack to position the internal view over the "old" base components
          position: 'absolute',
          top: 0,
          left: 0,
          alignItems: 'center',
          height: '100vh',
          zIndex: 1000,
        }}
      >
        <Grid container sx={{ height: '100%' }}>
          <Grid item>
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                height: '100%',
              }}
            >
              <SideMenu callback={handleMenuCallback} />
            </Box>
          </Grid>
          <Grid item padding={2} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Divider
              orientation="vertical"
              variant="middle"
              sx={{
                width: '1px',
                height: '100%',
                backgroundColor: grey[600],
              }}
            />
          </Grid>
          <Grid item xs={12} md={8} lg={9} padding={2}>
            <Dashboards />
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

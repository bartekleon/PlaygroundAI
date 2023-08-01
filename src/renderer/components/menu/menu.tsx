import { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TuneIcon from '@mui/icons-material/Tune';
import GetAppIcon from '@mui/icons-material/GetApp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageIcon from '@mui/icons-material/Image';

import { AppBar, Drawer, DrawerHeader } from './drawer';
import { MiniDrawerListItem } from './miniDrawerListItem';

export const MiniDrawer = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => setOpen(true);

  const handleDrawerClose = () => setOpen(false);

  return (
    <>
      <AppBar position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Mini variant drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <MiniDrawerListItem open={open} icon={<ImageIcon />} text='stable diffusion' link='/stablediffusion' />
          <MiniDrawerListItem open={open} icon={<MusicNoteIcon />} text='music' link='/music' />
        </List>
        <Divider />
        <List>
          <MiniDrawerListItem open={open} icon={<GetAppIcon />} text='installlation' link='/installation' />
          <MiniDrawerListItem open={open} icon={<TuneIcon />} text='settings' link='/settings' />
        </List>
      </Drawer>
    </>
  );
}

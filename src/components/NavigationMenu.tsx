import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

const navigationItems = [
  { label: 'Создать персонажа', path: '/create-character' },
  { label: 'Получить всех персонажей', path: '/characters' },
];

export const NavigationMenu = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <>
      <IconButton
        aria-label="Открыть навигацию"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: (theme) => theme.zIndex.drawer - 1,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          '&:hover': { backgroundColor: 'action.hover' },
        }}
      >
        <Box component="span" aria-hidden="true" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
          ☰
        </Box>
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 300, backgroundColor: 'background.paper' } } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" component="h2">
            Навигация
          </Typography>
        </Box>
        <Divider />
        <List aria-label="Основная навигация" sx={{ p: 1 }}>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
};

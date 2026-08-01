import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { fetchCharacters, fetchClasses } from '../../api';
import { useFetch } from '../../api/useFetch';
import { NavigationMenu } from '../../components/NavigationMenu';
import { getClassBackgroundImage } from '../../assets/class-icons';

const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const CharactersList = () => {
  const { data: characters, loading, error, refetch } = useFetch(fetchCharacters);
  const { data: classes } = useFetch(fetchClasses);
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', p: { xs: 2, sm: 3 }, pt: { xs: 8, sm: 3 } }}>
      <NavigationMenu />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 3 }}>
        <Typography variant="h3" component="h1">
          Все персонажи
        </Typography>
        <Button variant="outlined" onClick={refetch} disabled={loading}>
          Обновить
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Загрузка персонажей" />
        </Box>
      )}

      {error && <Alert severity="error">Не удалось загрузить персонажей: {error}</Alert>}

      {!loading && !error && characters?.length === 0 && (
        <Typography color="text.secondary">Сохранённых персонажей пока нет.</Typography>
      )}

      {!loading && !error && characters && characters.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {characters.map((character) => {
            const characterClass = classes?.find((item) => item._id === character.class_id);
            const backgroundImage = characterClass
              ? getClassBackgroundImage(characterClass.name)
              : undefined;

            return (
              <Card
                key={character._id}
                component="button"
                type="button"
                variant="outlined"
                onClick={() => navigate(`/characters/${character._id}`)}
                sx={{
                  position: 'relative',
                  isolation: 'isolate',
                  overflow: 'hidden',
                  minHeight: 220,
                  cursor: 'pointer',
                  textAlign: 'left',
                  border: '2px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  transition: theme.transitions.create([
                    'border-color',
                    'background-color',
                    'box-shadow',
                    'transform',
                  ]),
                  '&::before': backgroundImage
                    ? {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        zIndex: -1,
                        backgroundImage: `url("${backgroundImage}")`,
                        backgroundPosition: 'right 14px top 14px',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'min(42%, 132px)',
                        opacity: 0.16,
                        pointerEvents: 'none',
                      }
                    : undefined,
                  '&:hover, &:focus-visible': {
                    borderColor: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.22)}`,
                    transform: 'translateY(-2px)',
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <CardContent sx={{ minHeight: 'inherit', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" component="h2" sx={{ pr: backgroundImage ? 8 : 0 }}>
                    {character.name}
                  </Typography>
                  <Typography variant="body2" color="primary.main" sx={{ mt: 0.75 }}>
                    {characterClass?.name ?? 'Класс не найден'}
                  </Typography>
                  <Box sx={{ mt: 'auto', pt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Уровень: {character.level}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Хиты: {character.hit_points.current} / {character.hit_points.maximum}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                      Создан: {formatDate(character.created_at)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default CharactersList;

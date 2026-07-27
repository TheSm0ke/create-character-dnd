import { Alert, Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchCharacters } from '../../api';
import { useFetch } from '../../api/useFetch';
import { NavigationMenu } from '../../components/NavigationMenu';

const formatDate = (value: string) => new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

const CharactersList = () => {
  const { data: characters, loading, error, refetch } = useFetch(fetchCharacters);
  const navigate = useNavigate();

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
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
          {characters.map((character) => (
            <Card
              key={character._id}
              component="button"
              type="button"
              variant="outlined"
              onClick={() => navigate(`/characters/${character._id}`)}
              sx={{
                cursor: 'pointer',
                textAlign: 'left',
                '&:hover, &:focus-visible': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" component="h2">
                  {character.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Уровень: {character.level}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Хиты: {character.hit_points.current} / {character.hit_points.maximum}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                  Создан: {formatDate(character.created_at)}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CharactersList;

import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from '@mui/material';
import type { SearchInventoryItem } from './inventoryUtils';
import { getInventoryEntryFromSearchItem } from './inventoryUtils';

interface InventorySearchDialogProps {
  open: boolean;
  query: string;
  loading: boolean;
  error: string | null;
  items: SearchInventoryItem[];
  onQueryChange: (query: string) => void;
  onAddItem: (item: SearchInventoryItem) => void;
  onClose: () => void;
}

export const InventorySearchDialog = ({ open, query, loading, error, items, onQueryChange, onAddItem, onClose }: InventorySearchDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>Добавление предмета</DialogTitle>
    <DialogContent dividers>
      <TextField autoFocus label="Поиск по названию" value={query} onChange={(event) => onQueryChange(event.target.value)} fullWidth />
      {query.trim().length < 2 && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Введите не менее двух символов, чтобы найти предметы во всём справочнике.</Typography>}
      {loading && <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Поиск предметов…</Typography>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {!loading && query.trim().length >= 2 && !error && (
        items.length > 0 ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mt: 2 }}>
            {items.map((item) => {
              const entry = getInventoryEntryFromSearchItem(item, 1, 1, item.name);
              return (
                <Card key={item._id} variant="outlined"><CardContent>
                  <Typography variant="h6">{entry.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', my: 1 }}>
                    <Chip label={entry.type} size="small" variant="outlined" />
                    {entry.weight && <Chip label={`${entry.weight} фнт.`} size="small" color="secondary" />}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{entry.details}</Typography>
                  <Button size="small" variant="contained" sx={{ mt: 2 }} onClick={() => onAddItem(item)}>Добавить</Button>
                </CardContent></Card>
              );
            })}
          </Box>
        ) : <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>По этому названию ничего не найдено.</Typography>
      )}
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Готово</Button></DialogActions>
  </Dialog>
);

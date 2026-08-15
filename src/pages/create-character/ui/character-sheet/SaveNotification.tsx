import { Alert, Snackbar } from '@mui/material';

interface SaveNotificationProps {
  characterId?: string;
  savedCharacterId: string | null;
  error: string | null;
  onClose: () => void;
}

export const SaveNotification = ({ characterId, savedCharacterId, error, onClose }: SaveNotificationProps) => (
  <Snackbar open={Boolean(error || savedCharacterId)} autoHideDuration={5000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <Alert severity={error ? 'error' : 'success'} variant="filled" onClose={onClose}>
      {error ?? `${characterId ? 'Изменения сохранены.' : 'Персонаж создан.'} Идентификатор: ${savedCharacterId}`}
    </Alert>
  </Snackbar>
);

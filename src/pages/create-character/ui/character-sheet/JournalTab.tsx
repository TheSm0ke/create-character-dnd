import { Alert, Box, Button, Paper, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { CharacterJournalPage } from '../../../../api';
import { SummaryCard } from './SheetPrimitives';

const sanitizeJournalContent = (content: string) => {
  const template = document.createElement('template');
  template.innerHTML = content;
  const allowedTags = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BR', 'DIV', 'P', 'BLOCKQUOTE']);

  const sanitizeNode = (node: Node) => {
    [...node.childNodes].forEach(sanitizeNode);
    if (!(node instanceof HTMLElement)) return;

    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    [...node.attributes].forEach((attribute) => node.removeAttribute(attribute.name));
  };

  sanitizeNode(template.content);
  return template.innerHTML;
};

interface JournalEditorProps {
  pageId: string;
  value: string;
  onChange: (value: string) => void;
}

const JournalEditor = ({ pageId, value, onChange }: JournalEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const loadedPageIdRef = useRef<string | null>(null);
  const selectionRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (editorRef.current && loadedPageIdRef.current !== pageId) {
      editorRef.current.innerHTML = sanitizeJournalContent(value);
      loadedPageIdRef.current = pageId;
    }
  }, [pageId, value]);

  const syncContent = () => {
    if (editorRef.current) onChange(sanitizeJournalContent(editorRef.current.innerHTML));
  };

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.getRangeAt(0).commonAncestorContainer)) {
      selectionRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  };

  const applyFormat = (command: string, commandValue?: string) => {
    const selection = window.getSelection();
    const savedRange = selectionRangeRef.current;
    if (selection && savedRange && editorRef.current?.contains(savedRange.commonAncestorContainer)) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    } else {
      editorRef.current?.focus();
    }
    document.execCommand(command, false, commandValue);
    rememberSelection();
    syncContent();
  };

  return (
    <Box>
      <Box role="toolbar" aria-label="Форматирование заметки" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1 }}>
        <Button size="small" variant="outlined" aria-label="Жирный" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('bold')}><strong>Ж</strong></Button>
        <Button size="small" variant="outlined" aria-label="Курсив" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('italic')}><em>К</em></Button>
        <Button size="small" variant="outlined" aria-label="Подчёркнутый" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('underline')}><u>Ч</u></Button>
        <Button size="small" variant="outlined" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('insertUnorderedList')}>Список</Button>
        <Button size="small" variant="outlined" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('insertOrderedList')}>Нумерация</Button>
        <Button size="small" variant="outlined" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('formatBlock', 'blockquote')}>Цитата</Button>
        <Button size="small" color="inherit" onMouseDown={(event) => event.preventDefault()} onClick={() => applyFormat('removeFormat')}>Очистить</Button>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Выделите текст в заметке, затем выберите форматирование.
      </Typography>
      <Paper
        ref={editorRef}
        variant="outlined"
        contentEditable
        role="textbox"
        aria-label="Заметки"
        aria-multiline="true"
        suppressContentEditableWarning
        onInput={() => {
          rememberSelection();
          syncContent();
        }}
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onFocus={rememberSelection}
        onPaste={(event) => {
          event.preventDefault();
          document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
          syncContent();
        }}
        sx={{
          minHeight: 280,
          p: 2,
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          cursor: 'text',
          '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
          '& blockquote': { m: 0, pl: 1.5, borderLeft: 3, borderColor: 'primary.main', color: 'text.secondary' },
          '& i, & em': { fontStyle: 'italic' },
          '& ul, & ol': { pl: 3, my: 1 },
        }}
      />
    </Box>
  );
};

interface JournalTabProps {
  characterId?: string;
  pages: CharacterJournalPage[];
  saving: boolean;
  onPagesChange?: (pages: CharacterJournalPage[]) => void;
  onSave: () => void;
}

export const JournalTab = ({ characterId, pages, saving, onPagesChange, onSave }: JournalTabProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const selectedPage = pages[pageIndex];
  const canEdit = Boolean(characterId && onPagesChange);
  const addPage = () => {
    if (!onPagesChange) return;
    const id = typeof crypto?.randomUUID === 'function'
      ? crypto.randomUUID()
      : `journal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    onPagesChange([...pages, { id, title: `Страница ${pages.length + 1}`, content: '' }]);
    setPageIndex(pages.length);
  };
  const updatePage = (id: string, updates: Partial<CharacterJournalPage>) => {
    onPagesChange?.(pages.map((page) => (page.id === id ? { ...page, ...updates } : page)));
  };
  const removePage = (id: string) => {
    const nextPages = pages.filter((page) => page.id !== id);
    onPagesChange?.(nextPages);
    setPageIndex((index) => Math.max(0, Math.min(index, nextPages.length - 1)));
  };

  return (
    <SummaryCard title="Дневник">
      {!canEdit ? (
        <Alert severity="info">Дневник станет доступен после сохранения персонажа.</Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">Храните заметки кампании, цели и важные события.</Typography>
            <Button variant="outlined" size="small" onClick={addPage}>Добавить страницу</Button>
          </Box>
          {pages.length === 0 ? (
            <Typography color="text.secondary">В дневнике пока нет страниц.</Typography>
          ) : (
            <>
              <Tabs value={Math.min(pageIndex, pages.length - 1)} onChange={(_, value) => setPageIndex(value)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                {pages.map((page, index) => <Tab key={page.id} label={page.title || `Страница ${index + 1}`} />)}
              </Tabs>
              {selectedPage && (
                <Box sx={{ display: 'grid', gap: 2 }}>
                  <TextField label="Название страницы" value={selectedPage.title} onChange={(event) => updatePage(selectedPage.id, { title: event.target.value })} fullWidth />
                  <JournalEditor pageId={selectedPage.id} value={selectedPage.content} onChange={(content) => updatePage(selectedPage.id, { content })} />
                  <Typography variant="caption" color="text.secondary" align="right">{selectedPage.content.length} / 20000</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                    <Button color="error" onClick={() => removePage(selectedPage.id)}>Удалить страницу</Button>
                    <Button variant="contained" onClick={onSave} disabled={saving}>Сохранить дневник</Button>
                  </Box>
                </Box>
              )}
            </>
          )}
        </>
      )}
    </SummaryCard>
  );
};

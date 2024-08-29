import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, List, ListItem, ListItemText, TextField, Button, CircularProgress, IconButton, Snackbar } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { backend } from '../declarations/backend';

type Note = {
  id: bigint;
  subject: string;
  bulletPoints: string[];
};

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const { control, handleSubmit, setValue, reset } = useForm<{ subject: string; bulletPoints: string[] }>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'bulletPoints',
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const fetchedNotes = await backend.getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setSnackbar({ open: true, message: 'Failed to fetch notes' });
    }
    setLoading(false);
  };

  const onSubmit = async (data: { subject: string; bulletPoints: string[] }) => {
    setLoading(true);
    try {
      if (selectedNote) {
        const result = await backend.updateNote(selectedNote.id, data.subject, data.bulletPoints);
        if ('ok' in result) {
          setSnackbar({ open: true, message: 'Note updated successfully' });
        } else {
          setSnackbar({ open: true, message: result.err });
        }
      } else {
        const result = await backend.createNote(data.subject, data.bulletPoints);
        if ('ok' in result) {
          setSnackbar({ open: true, message: 'Note created successfully' });
        } else {
          setSnackbar({ open: true, message: result.err });
        }
      }
      fetchNotes();
      reset();
      setSelectedNote(null);
    } catch (error) {
      console.error('Error saving note:', error);
      setSnackbar({ open: true, message: 'Failed to save note' });
    }
    setLoading(false);
  };

  const deleteNote = async (id: bigint) => {
    setLoading(true);
    try {
      const result = await backend.deleteNote(id);
      if ('ok' in result) {
        setSnackbar({ open: true, message: 'Note deleted successfully' });
        fetchNotes();
        if (selectedNote?.id === id) {
          setSelectedNote(null);
          reset();
        }
      } else {
        setSnackbar({ open: true, message: result.err });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      setSnackbar({ open: true, message: 'Failed to delete note' });
    }
    setLoading(false);
  };

  const selectNote = async (id: bigint) => {
    try {
      const result = await backend.getNote(id);
      if ('ok' in result) {
        const note = result.ok;
        setSelectedNote(note);
        setValue('subject', note.subject);
        setValue('bulletPoints', note.bulletPoints);
      } else {
        setSnackbar({ open: true, message: result.err });
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      setSnackbar({ open: true, message: 'Failed to fetch note' });
    }
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Paper className="p-6" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?ixid=M3w2MzIxNTd8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MjQ5NjA4NjJ8&ixlib=rb-4.0.3)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom className="text-white">
          IC Notepad
        </Typography>
      </Paper>
      <Grid container spacing={4} className="mt-4">
        <Grid item xs={12} md={4}>
          <Paper className="p-4">
            <Typography variant="h6" gutterBottom>
              Notes
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <List>
                {notes.map((note) => (
                  <ListItem
                    key={note.id.toString()}
                    button
                    onClick={() => selectNote(note.id)}
                    selected={selectedNote?.id === note.id}
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => deleteNote(note.id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={note.subject} />
                  </ListItem>
                ))}
              </List>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedNote(null);
                reset();
              }}
              fullWidth
              className="mt-4"
            >
              New Note
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper className="p-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="subject"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Subject"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                  />
                )}
              />
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center mt-2">
                  <Controller
                    name={`bulletPoints.${index}`}
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={`Bullet Point ${index + 1}`}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                      />
                    )}
                  />
                  <IconButton onClick={() => remove(index)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append('')}
                variant="outlined"
                startIcon={<AddIcon />}
                className="mt-2"
              >
                Add Bullet Point
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                className="mt-4 ml-2"
              >
                {loading ? <CircularProgress size={24} /> : 'Save Note'}
              </Button>
            </form>
          </Paper>
          {selectedNote && (
            <Paper className="p-4 mt-4">
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Typography variant="subtitle1">{selectedNote.subject}</Typography>
              <ul>
                {selectedNote.bulletPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </Paper>
          )}
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default App;

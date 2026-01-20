import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notesApi from '../../services/notesApi';

/**
 * Notes Slice
 * Manages notes state and CRUD operations
 * 
 * State:
 * - notes: Array of notes
 * - currentNote: Currently selected/editing note
 * - loading: Loading state
 * - error: Error message
 * - filter: Current filter (all, archived)
 * - searchQuery: Search text
 */

const initialState = {
    notes: [],
    currentNote: null,
    loading: false,
    error: null,
    filter: 'all', // 'all' | 'archived'
    searchQuery: '',
};

/**
 * Async Thunk: Fetch all notes
 * GET /api/notes
 */
export const fetchNotes = createAsyncThunk(
    'notes/fetchNotes',
    async ({ archived = false, tag, search }, { rejectWithValue }) => {
        try {
            const data = await notesApi.getNotes({ archived, tag, search });
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch notes');
        }
    }
);

/**
 * Async Thunk: Create note
 * POST /api/notes
 */
export const createNote = createAsyncThunk(
    'notes/createNote',
    async (noteData, { rejectWithValue }) => {
        try {
            const data = await notesApi.createNote(noteData);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create note');
        }
    }
);

/**
 * Async Thunk: Update note
 * PUT /api/notes/:id
 */
export const updateNote = createAsyncThunk(
    'notes/updateNote',
    async ({ id, updates }, { rejectWithValue }) => {
        try {
            const data = await notesApi.updateNote(id, updates);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update note');
        }
    }
);

/**
 * Async Thunk: Delete note
 * DELETE /api/notes/:id
 */
export const deleteNote = createAsyncThunk(
    'notes/deleteNote',
    async (id, { rejectWithValue }) => {
        try {
            await notesApi.deleteNote(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete note');
        }
    }
);

/**
 * Async Thunk: Upload attachment
 * POST /api/notes/:id/upload
 */
export const uploadAttachment = createAsyncThunk(
    'notes/uploadAttachment',
    async ({ noteId, file }, { rejectWithValue }) => {
        try {
            const data = await notesApi.uploadAttachment(noteId, file);
            return { noteId, attachment: data.attachment };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to upload file');
        }
    }
);

/**
 * Notes Slice Definition
 */
const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        // Set current note for editing
        setCurrentNote: (state, action) => {
            state.currentNote = action.payload;
        },
        // Clear current note
        clearCurrentNote: (state) => {
            state.currentNote = null;
        },
        // Set filter
        setFilter: (state, action) => {
            state.filter = action.payload;
        },
        // Set search query
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Optimistic update for note content (for auto-save)
        updateNoteOptimistic: (state, action) => {
            const { id, updates } = action.payload;
            const note = state.notes.find(n => n._id === id);
            if (note) {
                Object.assign(note, updates);
            }
            if (state.currentNote && state.currentNote._id === id) {
                Object.assign(state.currentNote, updates);
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch Notes
        builder
            .addCase(fetchNotes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotes.fulfilled, (state, action) => {
                state.loading = false;
                state.notes = action.payload;
            })
            .addCase(fetchNotes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Create Note
        builder
            .addCase(createNote.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNote.fulfilled, (state, action) => {
                state.loading = false;
                state.notes.unshift(action.payload); // Add to beginning
                state.currentNote = action.payload;
            })
            .addCase(createNote.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // Update Note
        builder
            .addCase(updateNote.pending, (state) => {
                state.error = null;
            })
            .addCase(updateNote.fulfilled, (state, action) => {
                const index = state.notes.findIndex(n => n._id === action.payload._id);
                if (index !== -1) {
                    state.notes[index] = action.payload;
                }
                if (state.currentNote && state.currentNote._id === action.payload._id) {
                    state.currentNote = action.payload;
                }
            })
            .addCase(updateNote.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Delete Note
        builder
            .addCase(deleteNote.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteNote.fulfilled, (state, action) => {
                state.notes = state.notes.filter(n => n._id !== action.payload);
                if (state.currentNote && state.currentNote._id === action.payload) {
                    state.currentNote = null;
                }
            })
            .addCase(deleteNote.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Upload Attachment
        builder
            .addCase(uploadAttachment.fulfilled, (state, action) => {
                const { noteId, attachment } = action.payload;
                const note = state.notes.find(n => n._id === noteId);
                if (note) {
                    note.attachments.push(attachment);
                }
                if (state.currentNote && state.currentNote._id === noteId) {
                    state.currentNote.attachments.push(attachment);
                }
            });
    },
});

export const {
    setCurrentNote,
    clearCurrentNote,
    setFilter,
    setSearchQuery,
    clearError,
    updateNoteOptimistic,
} = notesSlice.actions;

export default notesSlice.reducer;

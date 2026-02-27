'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RichTextEditor from '../TextEditor/RichTextEditor';

interface BlogFormModalProps {
  open: boolean;
  loading: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (payload: any) => void;
}

const emptyForm = {
  title: '',
  description: '',
  thumbnail: null as File | null,
  content: '',
  categories: [''],
  tags: [''],
};

const BlogFormModal: React.FC<BlogFormModalProps> = ({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [formData, setFormData] = useState(emptyForm);

  // ✅ Track existing thumbnail URL separately (for edit mode preview)
  const [existingThumbnail, setExistingThumbnail] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ======================= RESET / EDIT LOAD ======================= */
  useEffect(() => {
    // ── Dialog closed → reset everything ──────────────────────────────
    if (!open) {
      setFormData(emptyForm);
      setExistingThumbnail(null);
      setErrors({});
      return;
    }

    // ── Dialog open + NO initialValues → create mode ──────────────────
    if (!initialValues) {
      setFormData(emptyForm);
      setExistingThumbnail(null);
      setErrors({});
      return;
    }

    // ── Dialog open + initialValues → edit mode ───────────────────────
    setFormData({
      title: initialValues.title || '',
      description: initialValues.description || '',
      thumbnail: null, // new file starts empty
      content: initialValues.content || '',
      categories: initialValues.categories?.length > 0 ? initialValues.categories : [''],
      tags: initialValues.tags?.length > 0 ? initialValues.tags : [''],
    });
    setExistingThumbnail(initialValues.thumbnail || null);
    setErrors({});
  }, [open, initialValues]);

  /* ======================= VALIDATION ======================= */
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.content || formData.content === '<p><br></p>') {
      newErrors.content = 'Content is required';
    }

    if (!formData.categories.length || formData.categories.some((c) => !c.trim())) {
      newErrors.categories = 'At least one category is required';
    }

    // Thumbnail required only on create — existing thumbnail counts as valid on edit
    if (!formData.thumbnail && !existingThumbnail && !initialValues) {
      newErrors.thumbnail = 'Thumbnail image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ======================= CATEGORY HANDLERS ======================= */
  const addCategory = () => {
    setFormData((prev) => ({ ...prev, categories: [...prev.categories, ''] }));
  };

  const updateCategory = (index: number, value: string) => {
    const updated = [...formData.categories];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, categories: updated }));
  };

  const removeCategory = (index: number) => {
    const updated = formData.categories.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, categories: updated.length ? updated : [''] }));
  };

  /* ======================= TAG HANDLERS ======================= */
  const addTag = () => {
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, ''] }));
  };

  const updateTag = (index: number, value: string) => {
    const updated = [...formData.tags];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, tags: updated }));
  };

  const removeTag = (index: number) => {
    const updated = formData.tags.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, tags: updated.length ? updated : [''] }));
  };

  /* ======================= SUBMIT ======================= */
  const handleSubmit = () => {
    if (!validateForm()) return;
    // Pass existingThumbnail so parent knows to keep it if no new file selected
    onSubmit({ ...formData, existingThumbnail });
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{initialValues ? 'Edit Blog' : 'Create Blog'}</DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* ── Title ── */}
          <TextField
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            error={!!errors.title}
            helperText={errors.title}
          />

          {/* ── Description ── */}
          <TextField
            label="Description"
            multiline
            rows={4}
            fullWidth
            required
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* ── Thumbnail ── */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Thumbnail Image {!initialValues && '*'}
            </Typography>

            {/* Show existing thumbnail preview in edit mode */}
            {existingThumbnail && !formData.thumbnail && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Current Thumbnail:
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={existingThumbnail}
                    alt="Current Thumbnail"
                    style={{
                      width: '200px',
                      height: 'auto',
                      borderRadius: '8px',
                      display: 'block',
                      border: '1px solid #e0e0e0',
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setExistingThumbnail(null)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'white',
                      '&:hover': { backgroundColor: '#fee2e2' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}

            <Button variant="outlined" component="label">
              {existingThumbnail && !formData.thumbnail ? 'Replace Image' : 'Upload Image'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    thumbnail: e.target.files?.[0] || null,
                  }))
                }
              />
            </Button>

            {/* Show newly selected file preview */}
            {formData.thumbnail && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Box>
                  <img
                    src={URL.createObjectURL(formData.thumbnail)}
                    alt="New Thumbnail Preview"
                    style={{
                      width: '200px',
                      height: 'auto',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                    }}
                  />
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    {formData.thumbnail.name} (
                    {formData.thumbnail.type.split('/')[1]?.toUpperCase()})
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setFormData((prev) => ({ ...prev, thumbnail: null }))}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}

            {errors.thumbnail && (
              <Typography variant="caption" color="error.main" display="block" sx={{ mt: 0.5 }}>
                {errors.thumbnail}
              </Typography>
            )}
          </Box>

          {/* ── Categories ── */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Categories *
            </Typography>

            {formData.categories.map((category, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  value={category}
                  onChange={(e) => updateCategory(index, e.target.value)}
                  placeholder="Enter category"
                  error={!!errors.categories}
                />
                <IconButton size="small" onClick={() => removeCategory(index)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            {errors.categories && (
              <Typography variant="caption" color="error.main">
                {errors.categories}
              </Typography>
            )}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addCategory}
              size="small"
              sx={{ mt: 1 }}
            >
              Add Category
            </Button>
          </Box>

          {/* ── Tags ── */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Tags
            </Typography>

            {formData.tags.map((tag, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  placeholder="Enter tag"
                />
                <IconButton size="small" onClick={() => removeTag(index)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addTag}
              size="small"
              sx={{ mt: 1 }}
            >
              Add Tag
            </Button>
          </Box>

          {/* ── Content ── */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Content *
            </Typography>

            <RichTextEditor
              value={formData.content}
              onChange={(value) => setFormData((prev) => ({ ...prev, content: value }))}
              placeholder="Type content here..."
            />

            {errors.content && (
              <Typography variant="caption" color="error.main">
                {errors.content}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={15} color="inherit" />}
        >
          {initialValues ? 'Update Blog' : 'Create Blog'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlogFormModal;

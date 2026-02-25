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

const BlogFormModal: React.FC<BlogFormModalProps> = ({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_image: null as File | null,
    content: '',
    categories: [''],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setFormData({
        title: '',
        description: '',
        thumbnail_image: null,
        content: '',
        categories: [''],
      });
      setErrors({});
      return;
    }

    if (initialValues) {
      setFormData({
        title: initialValues.title || '',
        description: initialValues.description || '',
        thumbnail_image: null,
        content: initialValues.content || '',
        categories: initialValues.categories?.length ? initialValues.categories : [''],
      });
      setErrors({});
    }
  }, [open, initialValues]);

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

    if (!formData.thumbnail_image && !initialValues) {
      newErrors.thumbnail_image = 'Thumbnail image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addCategory = () => {
    setFormData((prev) => ({
      ...prev,
      categories: [...prev.categories, ''],
    }));
  };

  const updateCategory = (index: number, value: string) => {
    const updated = [...formData.categories];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      categories: updated,
    }));
  };

  const removeCategory = (index: number) => {
    const updated = formData.categories.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      categories: updated.length ? updated : [''],
    }));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      ...formData,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle>{initialValues ? 'Edit Blog' : 'Create Blog'}</DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* Title */}
          <TextField
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            error={!!errors.title}
            helperText={errors.title}
          />

          {/* Description */}
          <TextField
            label="Description"
            multiline
            rows={4}
            fullWidth
            required
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            error={!!errors.description}
            helperText={errors.description}
          />

          {/* Thumbnail Upload */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Thumbnail Image *
            </Typography>

            <Button variant="outlined" component="label">
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    thumbnail_image: e.target.files?.[0] || null,
                  }))
                }
              />
            </Button>

            {errors.thumbnail_image && (
              <Typography variant="caption" color="error.main" display="block">
                {errors.thumbnail_image}
              </Typography>
            )}
          </Box>

          {/* Categories */}
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

          {/* Content (Same as Task page) */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Content *
            </Typography>

            <RichTextEditor
              value={formData.content}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  content: value,
                }))
              }
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

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Box,
  Stack,
  MenuItem,
  CircularProgress,
  IconButton,
  Grid2,
} from '@mui/material';
import axios from 'axios';
import { safeLocalStorageGet } from '@/utils/helpers';
import { accessTokenKey } from '@/utils/constants';
import { Client, ClientModalProps } from '../types';
import { CloseOutlined } from '@mui/icons-material';

export const ClientModal: React.FC<ClientModalProps> = ({
  open,
  setOpen,
  client,
  handleSaveClient,
  saving = false,
}) => {
  const [formValues, setFormValues] = useState<Partial<Client>>({
    clientName: '',
    name: '',
    projectName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    country: '',
    notes: '',
    photoUrl: '',
  });
  const [projects, setProjects] = useState<Array<{ _id: string; name: string }>>([]);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open]);

  useEffect(() => {
    if (client && open) {
      setFormValues({
        clientName: client.clientName || client.name || '',
        name: client.name || client.clientName || '',
        projectName: client.projectName || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || '',
        city: client.city || '',
        country: client.country || '',
        notes: client.notes || '',
        photoUrl: client.photoUrl || '',
      });
    } else if (!client && open) {
      // Reset form for new client
      setFormValues({
        clientName: '',
        name: '',
        projectName: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        city: '',
        country: '',
        notes: '',
        photoUrl: '',
      });
    }
  }, [client, open]);

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const token = safeLocalStorageGet(accessTokenKey);
      if (!token) return;

      const response = await axios.get('/api/projects?limit=1000', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const projectList = (response.data.projects || []).map((p: any) => ({
          _id: p._id,
          name: p.name || '',
        }));
        setProjects(projectList);
      }
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (field: keyof Client, value: string | number) => {
    const stringValue = typeof value === 'number' ? String(value) : value;
    setFormValues((prev) => ({ ...prev, [field]: stringValue }));
    // Also update the corresponding field
    if (field === 'clientName') {
      setFormValues((prev) => ({ ...prev, name: stringValue }));
    } else if (field === 'name') {
      setFormValues((prev) => ({ ...prev, clientName: stringValue }));
    }
  };

  const handleSave = () => {
    handleSaveClient(formValues);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      // Silently ignore unsupported types to avoid breaking UX
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setFormValues((prev) => ({
          ...prev,
          photoUrl: result,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >{client ? 'Edit Client' : 'Add Client'}

        <IconButton onClick={handleClose} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 24 }} dividers>
        <Stack spacing={2}>
          {/* Add Photo field (single combined field at top) */}
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 12 }}>
              <TextField
                label="Add Photo (optional)"
                fullWidth
                margin="normal"
                type="url"
                value={formValues.photoUrl || ''}
                onChange={(e) => handleChange('photoUrl', e.target.value)}
                placeholder="Paste image URL or use the upload icon"
                helperText="Optional. Supports any image; click the icon to upload JPG/PNG."
                sx={{ mt: 0 }}
                InputProps={{
                  endAdornment: (
                    <Button
                      component="label"
                      variant="text"
                      size="small"
                      sx={{ whiteSpace: 'nowrap', fontSize: 12 }}
                    >
                      Upload
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                      />
                    </Button>
                  ),
                }}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="Client Name"
                fullWidth
                margin="normal"
                required
                sx={{ mt: 0 }}
                value={formValues.clientName || formValues.name || ''}
                onChange={(e) => {
                  handleChange('clientName', e.target.value);
                  handleChange('name', e.target.value);
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="Project Name"
                fullWidth
                margin="normal"
                select
                value={formValues.projectName || ''}
                onChange={(e) => handleChange('projectName', e.target.value)}
                disabled={loadingProjects}
                sx={{ mt: 0 }}
                SelectProps={{
                  displayEmpty: true,
                }}
              >
                <MenuItem value="">
                  {/* <em>None</em> */}
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project._id} value={project.name}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>
              {loadingProjects && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                  <CircularProgress size={20} />
                </Box>
              )}
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                required
                value={formValues.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                sx={{ mt: 0 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="Phone"
                fullWidth
                margin="normal"
                value={formValues.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                sx={{ mt: 0 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="Company"
                fullWidth
                margin="normal"
                value={formValues.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                sx={{ mt: 0 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="Address"
                fullWidth
                margin="normal"
                value={formValues.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                sx={{ mt: 0 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="City"
                fullWidth
                margin="normal"
                value={formValues.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                sx={{ mt: 0 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="Country"
                fullWidth
                margin="normal"
                value={formValues.country || ''}
                onChange={(e) => handleChange('country', e.target.value)}
                sx={{ mt: 0 }}
              />
            </Grid2>
            <TextField
              label="Notes"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={formValues.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              sx={{ mt: 0 }}
            />
          </Grid2>
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderColor: 'divider',
        }}
      >
        <Button onClick={handleClose} disabled={saving}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: '50px',
            px: 3,
            py: 1.25,
            fontWeight: 500,

            color: (theme) => theme.palette.text.primary,
            borderColor: (theme) => theme.palette.divider,

            backgroundColor: 'transparent',

            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
              borderColor: (theme) => theme.palette.text.secondary,
            },
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}
          sx={{
            textTransform: 'none',
            borderRadius: '50px',
            px: 3,
            py: 1.25,
            fontWeight: 500,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],

            color: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.grey[900]
                : '#ffffff',

            boxShadow: 'none',

            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? theme.palette.grey[200]
                  : '#000000',
              boxShadow: 'none',
            },
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog >
  );
};

// Props for DeleteClient
interface DeleteClientProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  client: Client | null;
  handleDelete: () => void;
  saving?: boolean;
}

export const DeleteClient: React.FC<DeleteClientProps> = ({
  open,
  setOpen,
  client,
  handleDelete,
  saving = false,
}) => {
  const clientName = client?.clientName || client?.name || 'this client';

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>Delete Client
        <IconButton onClick={() => setOpen(false)} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 24 }} dividers>
        Are you sure you want to delete <strong>{clientName}</strong>? This action cannot be undone.
      </DialogContent>
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderColor: 'divider',
        }}
      >
        <Button onClick={() => setOpen(false)} disabled={saving}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderRadius: '50px',
            px: 3,
            py: 1.25,
            fontWeight: 500,

            color: (theme) => theme.palette.text.primary,
            borderColor: (theme) => theme.palette.divider,

            backgroundColor: 'transparent',

            '&:hover': {
              backgroundColor: (theme) => theme.palette.action.hover,
              borderColor: (theme) => theme.palette.text.secondary,
            },
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" disabled={saving}
          sx={{
            textTransform: 'none',
            borderRadius: '50px',
            px: 3,
            py: 1.25,
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          }}
        >
          {saving ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

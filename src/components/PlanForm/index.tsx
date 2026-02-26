'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  IconButton,
  CircularProgress,
  Box,
  Typography,
  Grid2,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, CloseOutlined } from '@mui/icons-material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { InputAdornment } from '@mui/material';

interface PlansFormModalProps {
  open: boolean;
  loading: boolean;
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (payload: any, form?: any) => void;
}

const PlansFormModal: React.FC<PlansFormModalProps> = ({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    plan_name: '',
    description: '',
    plan_type: '',
    trial_type: '',
    price: { monthly: 0, yearly: 0 },
    billing_period: '',
    users_allowed: 1,
    organizations_allowed: 1,
    best_for: '',
    access_level: '',
    features: [] as string[],
    status: 'active',
    mark_as_popular: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ FIXED: Proper array handling for API data structure
  useEffect(() => {
    if (!open) {
      setFormData({
        plan_name: '',
        description: '',
        plan_type: '',
        trial_type: '',
        price: { monthly: 0, yearly: 0 },
        billing_period: '',
        users_allowed: 1,
        organizations_allowed: 1,
        best_for: '',
        access_level: '',
        features: [],
        status: 'active',
        mark_as_popular: false,
      });
      setErrors({});
      return;
    }

    if (initialValues) {
      setFormData({
        plan_name: initialValues.plan_name || '',
        description: initialValues.description || '',
        // ✅ FIXED: Handle arrays from API → single strings for form
        plan_type: Array.isArray(initialValues.plan_type) ? initialValues.plan_type[0] || '' : initialValues.plan_type || '',
        trial_type: Array.isArray(initialValues.trial_type) ? initialValues.trial_type[0] || '' : initialValues.trial_type || '',
        // ✅ FIXED: Handle price object directly
        price: {
          monthly: initialValues.price?.monthly || initialValues.price?.Monthly || 0,
          yearly: initialValues.price?.yearly || initialValues.price?.Yearly || 0,
        },
        // ✅ FIXED: Handle billing_period array → single string
        billing_period: Array.isArray(initialValues.billing_period) ? initialValues.billing_period[0] || '' : initialValues.billing_period || '',
        users_allowed: initialValues.users_allowed || initialValues.Users_allowed || 1,
        organizations_allowed: initialValues.organizations_allowed || initialValues.Organizations_allowed || 1,
        best_for: initialValues.best_for || '',
        // ✅ FIXED: Handle access_level array → single string
        access_level: Array.isArray(initialValues.access_level) ? initialValues.access_level[0] || '' : initialValues.access_level || '',
        features: initialValues.features || [],
        status: initialValues.status || 'active',
        mark_as_popular: Boolean(initialValues.mark_as_popular),
      });
      setErrors({});
    }
  }, [open, initialValues]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Plan name validation - ✅ FIXED regex escape
    if (!formData.plan_name.trim()) {
      newErrors.plan_name = 'Plan name is required';
    } else if (!/^[A-Za-z0-9\s]+$/.test(formData.plan_name)) {
      newErrors.plan_name = 'Only letters, numbers and spaces allowed';
    } else if (formData.plan_name.length > 50) {
      newErrors.plan_name = 'Maximum 50 characters allowed';
    }

    // Required fields
    if (!formData.plan_type) newErrors.plan_type = 'Plan type is required';
    if (!formData.trial_type) newErrors.trial_type = 'Trial type is required';
    if (!formData.billing_period) newErrors.billing_period = 'Billing period is required';
    if (!formData.best_for.trim()) newErrors.best_for = 'Best for is required';
    if (!formData.access_level) newErrors.access_level = 'Access level is required';
    if (!formData.status) newErrors.status = 'Status is required';

    // Number validations
    if (formData.users_allowed <= 0 || !Number.isInteger(formData.users_allowed)) {
      newErrors.users_allowed = 'Users allowed must be a whole number greater than 0';
    }
    if (formData.organizations_allowed <= 0 || !Number.isInteger(formData.organizations_allowed)) {
      newErrors.organizations_allowed = 'Organizations allowed must be a whole number greater than 0';
    }
    if (formData.price.monthly < 0) newErrors.price_monthly = 'Monthly price cannot be negative';
    if (formData.price.yearly < 0) newErrors.price_yearly = 'Yearly price cannot be negative';

    // Features validation
    if (formData.features.length === 0) {
      newErrors.features = 'At least one feature is required';
    } else {
      formData.features.forEach((feature: string, index: number) => {
        if (!feature.trim()) {
          newErrors[`feature_${index}`] = `Feature ${index + 1} cannot be empty`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const isValid = validateForm();
    if (!isValid) return;

    const payload = {
      ...formData,
      // ✅ Convert back to API expected arrays
      plan_type: formData.plan_type ? [formData.plan_type] : [],
      trial_type: formData.trial_type ? [formData.trial_type] : [],
      access_level: formData.access_level ? [formData.access_level] : [],
      billing_period: formData.billing_period ? [formData.billing_period] : [],
      price: {
        monthly: Number(formData.price.monthly),
        yearly: Number(formData.price.yearly),
      },
    };

    onSubmit(payload);
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData((prev) => ({ ...prev, features: newFeatures }));
  };

  const isSubmitDisabled = loading;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >{initialValues ? 'Edit Plan' : 'Create Plan'}
        <IconButton onClick={onCancel} size="small">
          <CloseOutlined />
        </IconButton>
      </DialogTitle>
      <DialogContent style={{ paddingTop: 24 }} dividers>
        <Stack spacing={3}>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 12 }}>
              {/* Plan Name */}
              <TextField
                label="Plan Name"
                value={formData.plan_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, plan_name: e.target.value }))}
                error={!!errors.plan_name}
                helperText={errors.plan_name}
                required
                fullWidth
              />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 12 }}>
              {/* Description */}
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
                fullWidth
                inputProps={{ maxLength: 200 }}
              />
            </Grid2>
            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 6 }}>
              {/* Plan Type & Trial Type */}
              <FormControl fullWidth error={!!errors.plan_type} className='select_control'>
                <InputLabel>Plan Type</InputLabel>
                <Select
                  value={formData.plan_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, plan_type: e.target.value }))}
                  label="Plan Type"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="pro">Pro</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.trial_type} className='select_control'>
                <InputLabel>Trial Type</InputLabel>
                <Select
                  value={formData.trial_type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, trial_type: e.target.value }))}
                  label="Trial Type"
                >
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 6 }}>
              {/* Price Section */}
              <TextField
                label="Monthly Price"
                type="number"
                value={formData.price.monthly}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: { ...prev.price, monthly: Number(e.target.value) || 0 },
                  }))
                }
                error={!!errors.price_monthly}
                helperText={errors.price_monthly}
                required
                sx={{ flex: 1, width: '100%' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    step: 0.01,
                    style: { textAlign: 'right' },
                  },
                }}
              />
            </Grid2>
            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 6 }}>
              <TextField
                label="Yearly Price"
                type="number"
                value={formData.price.yearly}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: { ...prev.price, yearly: Number(e.target.value) || 0 },
                  }))
                }
                error={!!errors.price_yearly}
                helperText={errors.price_yearly}
                required
                sx={{ flex: 1, width: '100%' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                  inputProps: {
                    min: 0,
                    step: 0.01,
                    style: { textAlign: 'right' },
                  },
                }}
              />
            </Grid2>

            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 4 }}>
              {/* Billing Period & Users */}
              <FormControl fullWidth error={!!errors.billing_period} sx={{ flex: 2 }} className='select_control'>
                <InputLabel>Billing Period</InputLabel>
                <Select
                  value={formData.billing_period}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, billing_period: e.target.value }))
                  }
                  label="Billing Period"
                >
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 4 }}>
              <TextField
                label="Users Allowed"
                type="number"
                value={formData.users_allowed}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, users_allowed: Number(e.target.value) || 1 }))
                }
                error={!!errors.users_allowed}
                helperText={errors.users_allowed}
                inputProps={{ min: 1, step: 1 }}
                required
                sx={{ flex: 1, width: '100%' }}
              />
            </Grid2>
            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 4 }}>
              <TextField
                label="Organizations Allowed"
                type="number"
                value={formData.organizations_allowed}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    organizations_allowed: Number(e.target.value) || 1,
                  }))
                }
                error={!!errors.organizations_allowed}
                helperText={errors.organizations_allowed}
                inputProps={{ min: 1, step: 1 }}
                required
                sx={{ flex: 1, width: '100%' }}
              />
            </Grid2>

            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 6 }}>
              {/* Best For & Access Level */}
              <TextField
                label="Best For"
                value={formData.best_for}
                onChange={(e) => setFormData((prev) => ({ ...prev, best_for: e.target.value }))}
                placeholder="e.g. Startups / Teams / 10 users"
                error={!!errors.best_for}
                helperText={errors.best_for}
                required
                sx={{ flex: 1, width: '100%' }}
              />
            </Grid2>
            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!errors.access_level} sx={{ flex: 1 }} className='select_control'>
                <InputLabel>Access Level</InputLabel>
                <Select
                  value={formData.access_level}
                  onChange={(e) => setFormData((prev) => ({ ...prev, access_level: e.target.value }))}
                  label="Access Level"
                >
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="core">Core</MenuItem>
                </Select>
              </FormControl>
            </Grid2>

            {/* Features */}
            <Grid2  size={{ xs: 12, md: 12 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                  Features <span style={{ color: 'red' }}>*</span>
                </Typography>
                {formData.features.map((feature, index) => (
                  <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <TextField
                      fullWidth
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter feature"
                      error={!!errors[`feature_${index}`]}
                      helperText={errors[`feature_${index}`]}
                      sx={{ flex: 1 }}
                    />
                    <IconButton size="small" onClick={() => removeFeature(index)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                {errors.features && !formData.features.length && (
                  <Typography
                    variant="caption"
                    color="error.main"
                    sx={{ display: 'block', mt: -1, mb: 1 }}
                  >
                    {errors.features}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addFeature}
                  size="small"
                  sx={{ mt: 1, borderRadius: '50px' }}
                >
                  Add Feature
                </Button>
              </Box>
            </Grid2>

            <Grid2 sx={{mt: 2}} size={{ xs: 12, md: 6 }}>
              {/* Status & Popular */}
              <FormControl fullWidth error={!!errors.status} sx={{ flex: 1 }} className='select_control'>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.mark_as_popular}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, mark_as_popular: e.target.checked }))
                  }
                />
              }
              label="Mark as Popular"
              sx={{ minWidth: 0 }}
            />
          </Grid2>
        </Stack>

      </DialogContent>
      <DialogActions sx={{
        px: 3,
        py: 2,
        borderColor: 'divider',
      }}>
        <Button onClick={onCancel} disabled={loading}
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
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={loading && <CircularProgress size={15} color="inherit" />}
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
          {initialValues ? 'Update Plan' : 'Create Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlansFormModal;

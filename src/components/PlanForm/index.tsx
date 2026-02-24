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
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
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
    // Store price as strings for better input UX, convert on submit
    price: { monthly: '', yearly: '' },
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
        price: { monthly: '', yearly: '' },
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
        // ✅ FIXED: Handle price object safely and as strings (no nulls)
        price: {
          monthly:
            initialValues.price?.monthly ??
            initialValues.price?.Monthly ??
            '',
          yearly:
            initialValues.price?.yearly ??
            initialValues.price?.Yearly ??
            '',
        },
        // ✅ FIXED: Handle billing_period array:
        // - If it includes both monthly & yearly, treat as "both"
        // - Otherwise, take the first value as a single selection
        billing_period: (() => {
          const bp = initialValues.billing_period;
          if (Array.isArray(bp)) {
            const hasMonthly = bp.includes('monthly');
            const hasYearly = bp.includes('yearly');
            if (hasMonthly && hasYearly) return 'both';
            return bp[0] || '';
          }
          return bp || '';
        })(),
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
    const monthlyValue = formData.price.monthly === '' ? 0 : Number(formData.price.monthly);
    const yearlyValue = formData.price.yearly === '' ? 0 : Number(formData.price.yearly);

    if (Number.isNaN(monthlyValue) || monthlyValue < 0) {
      newErrors.price_monthly = 'Monthly price cannot be negative';
    }
    if (Number.isNaN(yearlyValue) || yearlyValue < 0) {
      newErrors.price_yearly = 'Yearly price cannot be negative';
    }

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
      billing_period: formData.billing_period
        ? formData.billing_period === 'both'
          ? ['monthly', 'yearly']
          : [formData.billing_period]
        : [],
      price: {
        monthly: Number(formData.price.monthly || 0),
        yearly: Number(formData.price.yearly || 0),
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
      <DialogTitle>{initialValues ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3}>
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

          {/* Plan Type & Trial Type */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth error={!!errors.plan_type}>
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
            <FormControl fullWidth error={!!errors.trial_type}>
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
          </Stack>

          {/* Price Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Price
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Monthly Price"
                type="number"
                value={formData.price.monthly}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: { ...prev.price, monthly: e.target.value },
                  }))
                }
                error={!!errors.price_monthly}
                helperText={errors.price_monthly}
                required
                sx={{ flex: 1 }}
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
              <TextField
                label="Yearly Price"
                type="number"
                value={formData.price.yearly}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: { ...prev.price, yearly: e.target.value },
                  }))
                }
                error={!!errors.price_yearly}
                helperText={errors.price_yearly}
                required
                sx={{ flex: 1 }}
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
            </Stack>
          </Box>

          {/* Billing Period & Users */}
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth error={!!errors.billing_period} sx={{ flex: 2 }}>
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
                <MenuItem value="both">Both (Monthly &amp; Yearly)</MenuItem>
              </Select>
            </FormControl>
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
              sx={{ flex: 1 }}
            />
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
              sx={{ flex: 1 }}
            />
          </Stack>

          {/* Best For & Access Level */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Best For"
              value={formData.best_for}
              onChange={(e) => setFormData((prev) => ({ ...prev, best_for: e.target.value }))}
              placeholder="e.g. Startups / Teams / 10 users"
              error={!!errors.best_for}
              helperText={errors.best_for}
              required
              sx={{ flex: 2 }}
            />
            <FormControl fullWidth error={!!errors.access_level} sx={{ flex: 1 }}>
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
          </Stack>

          {/* Features */}
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
              sx={{ mt: 1, borderRadius: '6px' }}
            >
              Add Feature
            </Button>
          </Box>

          {/* Status & Popular */}
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl fullWidth error={!!errors.status} sx={{ flex: 1 }}>
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
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          startIcon={loading && <CircularProgress size={15} color="inherit" />}
        >
          {initialValues ? 'Update Plan' : 'Create Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlansFormModal;

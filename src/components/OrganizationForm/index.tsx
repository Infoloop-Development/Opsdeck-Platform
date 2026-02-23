'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  CircularProgress,
  Typography,
} from '@mui/material';
import { plansAPI } from '@/lib/api/org_client';
interface Organization {
  _id?: string;
  name?: string;
  slug?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  planId?: string | { _id: string };
}

interface FormValues {
  name: string;
  slug: string;
  firstName: string;
  lastName: string;
  email: string;
  ownerPassword?: string;
  planId: string;
}

interface OrganizationFormModalProps {
  open: boolean;
  loading: boolean;
  initialValues?: Organization;
  onCancel: () => void;
  onSubmit: (values: FormValues, form?: any) => void;
}

const OrganizationFormModal: React.FC<OrganizationFormModalProps> = ({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}) => {
  const isEditing = Boolean(initialValues?._id);

  const [formData, setFormData] = useState<FormValues>({
    name: '',
    slug: '',
    firstName: '',
    lastName: '',
    email: '',
    ownerPassword: '',
    planId: '',
  });

  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ FIXED: Real-time field validation
  const validateField = (field: keyof FormValues, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Company name is required';
        if (!/^[A-Za-z\s]+$/.test(value)) return 'Company name must not contain numbers';
        return '';

      case 'slug':
        if (!value.trim()) return 'Company slug is required';
        if (!/^[a-z0-9-]+$/i.test(value))
          return 'Slug can contain lowercase letters, numbers, and hyphens only';
        return '';

      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (!/^[A-Za-z\s]+$/.test(value)) return 'First name must not contain numbers';
        return '';

      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (!/^[A-Za-z\s]+$/.test(value)) return 'Last name must not contain numbers';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return '';

      case 'ownerPassword':
        if (!isEditing && !value.trim()) return 'Password is required';
        return '';

      case 'planId':
        if (!value) return 'Please select a plan';
        return '';

      default:
        return '';
    }
  };

  // Load plans
  const fetchPlans = useCallback(async () => {
    if (!open) return;
    setPlansLoading(true);
    try {
      const res = await plansAPI.list();
      setPlans(res.data?.plans?.filter((plan: any) => plan.status === 'active') || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      setPlans([]);
    } finally {
      setPlansLoading(false);
    }
  }, [open]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        slug: '',
        firstName: '',
        lastName: '',
        email: '',
        ownerPassword: '',
        planId: '',
      });
      setErrors({});
      setPlans([]);
      return;
    }

    fetchPlans();

    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        slug: initialValues.slug || '',
        firstName: initialValues.firstName || '',
        lastName: initialValues.lastName || '',
        email: initialValues.email || '',
        ownerPassword: '',
        planId:
          typeof initialValues.planId === 'object'
            ? initialValues.planId?._id || ''
            : initialValues.planId || '',
      });
      setErrors({});
    }
  }, [open, initialValues, fetchPlans]);

  // ✅ FIXED: Real-time validation on change
  const handleFieldChange =
    (field: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error immediately when user types
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    };

  const handleSelectChange = (field: keyof FormValues) => (e: any) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error immediately when user selects
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // ✅ FIXED: Only validate on submit - show errors only for invalid fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate all fields and only keep invalid ones
    (Object.keys(formData) as (keyof FormValues)[]).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const isValid = validateForm();
    if (!isValid) return;
    onSubmit(formData);
  };

  // ✅ FIXED: Submit disabled only when loading OR has validation errors
  const isSubmitDisabled = loading || Object.keys(errors).length > 0;

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason === 'backdropClick') return;
        onCancel();
      }}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '70vh',
        },
      }}
    >
      <DialogTitle>{isEditing ? 'Edit Organization' : 'Add Organization'}</DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* Company Name */}
          <TextField
            label="Company Name"
            value={formData.name}
            onChange={handleFieldChange('name')}
            error={!!errors.name}
            helperText={errors.name || 'No numbers allowed'}
            required
            fullWidth
          />

          {/* Company Slug */}
          <TextField
            label="Company Slug"
            value={formData.slug}
            onChange={handleFieldChange('slug')}
            error={!!errors.slug}
            helperText={errors.slug || 'lowercase letters, numbers, hyphens only'}
            required
            fullWidth
          />

          {/* Owner First Name & Last Name */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Owner First Name"
              value={formData.firstName}
              onChange={handleFieldChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName || 'No numbers allowed'}
              required
              sx={{ flex: 1 }}
            />
            <TextField
              label="Owner Last Name"
              value={formData.lastName}
              onChange={handleFieldChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName || 'No numbers allowed'}
              required
              sx={{ flex: 1 }}
            />
          </Stack>

          {/* Owner Email */}
          <TextField
            label="Owner Email"
            type="email"
            value={formData.email}
            onChange={handleFieldChange('email')}
            error={!!errors.email}
            helperText={errors.email || 'example@company.com'}
            required
            fullWidth
          />

          {/* Owner Password (only for create) */}
          {!isEditing && (
            <TextField
              label="Owner Password"
              type="password"
              value={formData.ownerPassword}
              onChange={handleFieldChange('ownerPassword')}
              error={!!errors.ownerPassword}
              helperText={errors.ownerPassword || 'Minimum 8 characters recommended'}
              required
              fullWidth
            />
          )}

          {/* Select Plan */}
          <FormControl fullWidth error={!!errors.planId}>
            <InputLabel>Select Plan</InputLabel>
            <Select
              value={formData.planId}
              onChange={handleSelectChange('planId')}
              label="Select Plan"
              disabled={plansLoading}
              displayEmpty
            >
              {plansLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading plans...
                </MenuItem>
              ) : plans.length === 0 ? (
                <MenuItem disabled>No active plans available</MenuItem>
              ) : (
                plans.map((plan) => (
                  <MenuItem key={plan._id} value={plan._id}>
                    {plan.plan_name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.planId && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.planId}
              </Typography>
            )}
          </FormControl>
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
          {loading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
              ? 'Update Organization'
              : 'Add Organization'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrganizationFormModal;

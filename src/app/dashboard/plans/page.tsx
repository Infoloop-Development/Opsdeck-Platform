'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Chip,
  Avatar,
  Pagination,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Switch,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';

import { AddOutlined, MoreVert, Search } from '@mui/icons-material';

import PageHeader from '@/components/PageHeader';
import PlansFormModal from '@/components/PlanForm';
import axios from 'axios';
import { enqueueSnackbar } from 'notistack';
import api from '@/lib/api/org_client';

const PAGE_SIZE = 10;

interface Plan {
  _id: string;
  plan_name: string;
  plan_type?: string | string[];
  trial_type?: string | string[];
  billing_period?: string | string[];
  price?: any;
  users_allowed?: number;
  access_level?: string | string[];
  mark_as_popular?: boolean;
  status: 'active' | 'inactive';
}

const PlansManagementPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const open = Boolean(anchorEl);

  /* ================= FIXED: Debounced fetch ================= */
  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await api.get(`/superadmin/plans?${params.toString()}`);

      console.log('API RESPONSE:', response.data);

      const planData = response.data?.plans || [];
      setPlans(planData);
      setTotalPages(response.data?.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Fetch error:', error);
      enqueueSnackbar({
        message: error.response?.data?.error || 'Failed to fetch plans',
        variant: 'error',
      });
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, limit]);

  // ✅ FIXED: Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlans();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchPlans]);

  /* ================= MENU ================= */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, plan: Plan) => {
    setAnchorEl(event.currentTarget);
    setSelectedPlan(plan);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlan(null);
  };

  /* ================= CREATE/EDIT ================= */

  const handleOpenEdit = useCallback(() => {
    setDialogOpen(true);
    setAnchorEl(null); // close menu only
  }, []);

  const handleOpenCreate = useCallback(() => {
    setSelectedPlan(null);
    setDialogOpen(true);
  }, []);

  /* ================= FIXED: Safe data handling ================= */
  const handleSubmit = useCallback(
    async (formData: any) => {
      setSaving(true);
      try {
        if (selectedPlan?._id) {
          // ✅ FIXED: Safe patch
          await api.patch(`/superadmin/plans/${selectedPlan._id}`, formData);
          enqueueSnackbar({ message: 'Plan updated successfully', variant: 'success' });
        } else {
          await api.post('/superadmin/plans', formData);
          enqueueSnackbar({ message: 'Plan created successfully', variant: 'success' });
        }
        fetchPlans();
        setDialogOpen(false);
        setSelectedPlan(null);
      } catch (error: any) {
        enqueueSnackbar({
          message: error.response?.data?.error || 'Failed to save plan',
          variant: 'error',
        });
      } finally {
        setSaving(false);
      }
    },
    [selectedPlan?._id, fetchPlans]
  );

  /* ================= DELETE CONFIRMATION ================= */
  const handleDeleteConfirm = async () => {
    if (!selectedPlan?._id) return;
    try {
      await api.delete(`/superadmin/plans/${selectedPlan._id}`);
      enqueueSnackbar({
        message: 'Plan deleted successfully',
        variant: 'success',
      });

      setDeleteDialogOpen(false);
      fetchPlans();
    } catch (error: any) {
      enqueueSnackbar({
        message: error.response?.data?.error || 'Failed to delete plan',
        variant: 'error',
      });
    }
  };

  /* ================= FIXED: Safe status toggle ================= */
  const handleToggleStatus = async (plan: Plan) => {
    if (!plan._id) return;

    const newStatus = plan.status === 'active' ? 'inactive' : 'active';

    try {
      await api.patch(`/superadmin/plans/${plan._id}`, {
        status: newStatus,
      });

      enqueueSnackbar({
        message: `Plan ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        variant: 'success',
      });
      fetchPlans();
    } catch (error: any) {
      enqueueSnackbar({
        message: 'Failed to update status',
        variant: 'error',
      });
    }
  };

  // ✅ FIXED: Loading state
  if (loading && plans.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 400, pt: 10 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading plans...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          padding: '16px 24px',
          borderRadius: '8px',
          mb: 3,
        }}
      >
        <PageHeader
          title="Plans"
          action={
            <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search Plans.."
                type="search"
                InputProps={{
                  startAdornment: <Search fontSize="small" />,
                }}
                sx={{
                  width: { xs: 'unset', lg: '520px' },
                  maxWidth: '100%',
                  borderRadius: '6px',

                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark' ? theme.palette.background.default : '#F9FAFC',

                  '& .MuiOutlinedInput-root': {
                    gap: 1,
                    color: (theme) => theme.palette.text.primary,

                    '& fieldset': {
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    },

                    '&:hover fieldset': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? theme.palette.primary.main : '#CBD5E1',
                    },
                  },
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddOutlined />}
                onClick={handleOpenCreate}
                sx={{
                  borderRadius: '6px',
                  fontWeight: 500,
                  color: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),

                  borderColor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),

                  '&:hover': {
                    borderColor: (theme) => (theme.palette.mode === 'dark' ? '#fff' : '#000'),

                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                Add Plan
              </Button>
            </Stack>
          }
        />
      </Box>

      {/* ================= TABLE ================= */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '8px',
          border: '1px solid #EDEFF3',
        }}
      >
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Plan</TableCell>
                <TableCell align="center">Type</TableCell>
                <TableCell align="center">Trial</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Users</TableCell>
                <TableCell align="center">Access</TableCell>
                <TableCell align="center">Popular</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography sx={{ py: 4 }}>
                      {loading ? 'Loading...' : 'No plans found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                          {plan.plan_name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={500} noWrap>
                            {plan.plan_name}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    {/* ✅ FIXED: Safe array handling */}
                    <TableCell align="center">
                      {Array.isArray(plan.plan_type) && plan.plan_type.length > 0
                        ? plan.plan_type.map((t) => (
                            <Chip key={t} label={t} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))
                        : '-'}
                    </TableCell>

                    <TableCell align="center">
                      {Array.isArray(plan.trial_type) && plan.trial_type.length > 0
                        ? plan.trial_type.map((t) => (
                            <Chip
                              key={t}
                              label={t}
                              size="small"
                              color={t === 'free' ? 'success' : 'warning'}
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))
                        : '-'}
                    </TableCell>

                    {/* ✅ FIXED: Safe price display */}
                    <TableCell align="center">
                      {plan.price && plan.billing_period
                        ? Array.isArray(plan.billing_period)
                          ? (plan.price[plan.billing_period[0]] ?? '-')
                          : (plan.price[plan.billing_period] ?? '-')
                        : '-'}
                    </TableCell>

                    <TableCell align="center">
                      <Chip label={plan.users_allowed || 0} size="small" />
                    </TableCell>

                    <TableCell align="center">
                      {Array.isArray(plan.access_level) && plan.access_level.length > 0
                        ? plan.access_level.map((a) => (
                            <Chip key={a} label={a} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))
                        : '-'}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={plan.mark_as_popular ? 'YES' : 'NO'}
                        size="small"
                        color={plan.mark_as_popular ? 'warning' : 'default'}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Switch
                          checked={plan.status === 'active'}
                          onChange={() => handleToggleStatus(plan)}
                          color="success"
                          disabled={saving}
                        />
                        <Typography
                          variant="body2"
                          color={plan.status === 'active' ? 'success.main' : 'text.secondary'}
                          fontWeight={500}
                        >
                          {plan.status === 'active' ? 'Active' : 'Inactive'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, plan)}
                        disabled={saving}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>

      {/* ================= ACTION MENU ================= */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenEdit} disabled={!selectedPlan || saving}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
          disabled={!selectedPlan || saving}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Plan</DialogTitle>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography>
            Are you sure you want to delete <strong>{selectedPlan?.plan_name}</strong>? This action
            cannot be undone.
          </Typography>
        </Box>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={saving}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= FORM MODAL ================= */}
      <PlansFormModal
        open={dialogOpen}
        initialValues={selectedPlan}
        loading={saving}
        onCancel={() => {
          setDialogOpen(false);
          setSelectedPlan(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default PlansManagementPage;

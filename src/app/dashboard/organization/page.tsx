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
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  Typography,
  CircularProgress,
  Stack,
  Pagination,
  MenuItem,
  Switch,
  Menu,
  Chip,
  Avatar,
  DialogContent,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { AddOutlined, CloseOutlined, MoreVert, Search } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import api from '@/lib/api/org_client';
import OrganizationFormModal from '../../../components/OrganizationForm';

interface Organization {
  _id: string;
  name: string;
  slug: string;
  planId: string;
  status: 'active' | 'inactive';
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Plan {
  _id: string;
  plan_name: string;
  status?: string;
}

const PAGE_SIZE = 10;

const OrganizationManagementPage: React.FC = () => {
  /* ================= STATE ================= */
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });

  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editInitialValues, setEditInitialValues] = useState<any>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const menuOpen = Boolean(anchorEl);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  /* ================= FETCH ORGANIZATIONS ================= */
  const fetchOrganizations = useCallback(
    async (page = 1, limit = PAGE_SIZE, searchTerm = '', plan = '', status = '') => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(plan && { plan }),
          ...(status && { status }),
        });

        const response = await api.get(`/superadmin/organizations?${params.toString()}`);

        if (response.data.success) {
          setOrganizations(response.data.organizations || []);
          setPagination({
            current: response.data.pagination?.page || page,
            pageSize: response.data.pagination?.limit || limit,
            total: response.data.pagination?.total || 0,
          });
        }
      } catch (error: any) {
        enqueueSnackbar(error?.response?.data?.error || 'Failed to fetch organizations', {
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchOrganizations(
      pagination.current,
      pagination.pageSize,
      search,
      selectedPlanName || '',
      selectedStatus || ''
    );
  }, [pagination.current, search, selectedPlanName, selectedStatus, fetchOrganizations]);

  /* ================= FETCH PLANS ================= */
  useEffect(() => {
    const fetchPlansData = async () => {
      try {
        const response = await api.get('/superadmin/plans');
        if (response.data.success) {
          setPlans(response.data.plans || []);
        }
      } catch {
        enqueueSnackbar('Failed to fetch plans', { variant: 'error' });
      }
    };

    fetchPlansData();
  }, []);

  /* ================= FILTER HANDLERS ================= */
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  const handlePlanFilter = useCallback(
    (planId: string | null) => {
      const planName = planId ? plans.find((p) => p._id === planId)?.plan_name : null;
      setSelectedPlanId(planId);
      setSelectedPlanName(planName || null);
      setPagination((prev) => ({ ...prev, current: 1 }));
    },
    [plans]
  );

  const handleStatusFilter = useCallback((status: string | null) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, []);

  /* ================= CREATE / EDIT ================= */
  const openCreateModal = () => {
    setIsEditing(false);
    setEditInitialValues(null);
    setOpen(true);
  };

  const openEditModal = (org: Organization) => {
    setIsEditing(true);
    setEditInitialValues({
      _id: org._id,
      name: org.name,
      slug: org.slug,
      firstName: org.owner.firstName,
      lastName: org.owner.lastName,
      email: org.owner.email,
      planId: org.planId,
    });
    setOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      setSubmitLoading(true);

      const payload = {
        name: values.name,
        slug: values.slug,
        planId: values.planId,
        owner: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          ...(isEditing ? {} : { password: values.ownerPassword }),
        },
      };

      if (isEditing && editInitialValues?._id) {
        await api.patch(`/superadmin/organizations/${editInitialValues._id}`, payload);
        enqueueSnackbar('Organization updated successfully', { variant: 'success' });
      } else {
        await api.post('/superadmin/organizations', payload);
        enqueueSnackbar('Organization created successfully', { variant: 'success' });
      }

      setOpen(false);
      fetchOrganizations(
        pagination.current,
        pagination.pageSize,
        search,
        selectedPlanName || '',
        selectedStatus || ''
      );
    } catch (error: any) {
      enqueueSnackbar(error?.response?.data?.error || 'Operation failed', { variant: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async () => {
    if (!selectedOrganization?._id) return;

    try {
      await api.delete(`/superadmin/organizations/${selectedOrganization._id}`);
      enqueueSnackbar('Organization deleted successfully', { variant: 'success' });
      setDeleteDialogOpen(false);
      fetchOrganizations(
        pagination.current,
        pagination.pageSize,
        search,
        selectedPlanName || '',
        selectedStatus || ''
      );
    } catch {
      enqueueSnackbar('Failed to delete organization', { variant: 'error' });
    }
  };

  /* ================= STATUS TOGGLE ================= */
  const handleToggleStatus = async (org: Organization) => {
    if (!org._id) return;

    try {
      setToggleLoadingId(org._id);
      const newStatus = org.status === 'active' ? 'inactive' : 'active';

      await api.patch(`/superadmin/organizations/${org._id}/status`, { status: newStatus });
      enqueueSnackbar(
        `Organization ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
        { variant: 'success' }
      );

      fetchOrganizations(
        pagination.current,
        pagination.pageSize,
        search,
        selectedPlanName || '',
        selectedStatus || ''
      );
    } catch {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    } finally {
      setToggleLoadingId(null);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading && organizations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 400, pt: 10 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading organizations...</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: '16px',
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.palette.divider
            }`,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #0f172a 0%, #0b1220 100%)'
              : theme.palette.background.paper,
        }}
      >
        <Box
          display="flex"
          gap='10px'
          alignItems="center"
          flexWrap="wrap"
          justifyContent="space-between"
        >
          {/* LEFT SIDE */}
          <Box
            display="flex"
            gap='10px'
            alignItems="center"
            flexWrap={{xs: 'wrap', md: 'nowrap'}}
          >
            {/* SEARCH */}
            <Box>
              <TextField
                fullWidth
                size="small"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search
                      fontSize="small"
                      sx={{
                        mr: 1,
                        color: (theme) =>
                          theme.palette.mode === 'dark' ? '#cbd5e1' : theme.palette.text.secondary,
                      }}
                    />
                  ),
                  endAdornment: search ? (
                    <IconButton
                      size="small"
                      onClick={() => handleSearch('')}
                      sx={{
                        width: 22,
                        height: 22,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.2)'
                            : 'rgba(0,0,0,0.08)',
                        '&:hover': {
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.35)'
                              : 'rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      <ClearIcon
                        sx={{
                          fontSize: 14,
                          color: (theme) =>
                            theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                        }}
                      />
                    </IconButton>
                  ) : null,
                }}
                sx={{
                  width: { xs: "unset", lg: "520px" },
                  maxWidth: "100%",
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '50px',
                    height: 42,
                    color: (theme) => theme.palette.text.primary,
                    '& fieldset': {
                      borderColor: (theme) => theme.palette.divider,
                      borderRadius: '50px',
                    },
                    '&:hover fieldset': {
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? theme.palette.primary.main : '#CBD5E1',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                  },
                  '& input::placeholder': {
                    color: (theme) => theme.palette.text.secondary,
                    opacity: 0.8,
                  },
                }}
              />
            </Box>

            {/* FILTER 1 */}
            <TextField
              select
              size="small"
              label="Plan"
              value={selectedPlanId || ''}
              onChange={(e) => handlePlanFilter(e.target.value || null)}
              sx={{
                minWidth: 180,
                borderRadius: '50px',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.background.default : '#F9FAFC',
                '& .MuiOutlinedInput-root': {
                  color: (theme) => theme.palette.text.primary,
                  borderRadius: '50px',
                },
              }}
            >
              <MenuItem value="">All Plans</MenuItem>
              {plans.map((plan) => (
                <MenuItem key={plan._id} value={plan._id}>
                  {plan.plan_name}
                </MenuItem>
              ))}
            </TextField>

            {/* FILTER 2 */}
            <TextField
              select
              size="small"
              label="Status"
              value={selectedStatus || ''}
              onChange={(e) => handleStatusFilter(e.target.value || null)}
              sx={{
                minWidth: 150,
                borderRadius: '50px',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.background.default : '#F9FAFC',
                '& .MuiOutlinedInput-root': {
                  color: (theme) => theme.palette.text.primary,
                  borderRadius: '50px',
                },
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </Box>

          {/* RIGHT BUTTON */}
          <Button
            onClick={openCreateModal}
            startIcon={<AddOutlined />}
            sx={{
              borderRadius: '50px',
              px: 3,
              height: 42,
              textTransform: 'none',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              alignSelf: { xs: 'stretch', lg: 'center' },
              color: (theme) => theme.palette.text.primary,
              border: (theme) =>
                `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : theme.palette.divider
                }`,
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                borderColor: (theme) => theme.palette.text.primary,
              },
            }}
          >
            Add Organization
          </Button>
        </Box>
      </Paper>
      {/* ================= TABLE ================= */}
      <Paper elevation={0} sx={{ borderRadius: '10px' }}>
        <TableContainer sx={{ borderRadius: '10px' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    Organization
                  </Stack>
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>Owner</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ py: 4 }}>
                      {loading ? 'Loading...' : 'No organizations found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {org.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={500} noWrap>
                            {org.name}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {org.owner.firstName} {org.owner.lastName}
                    </TableCell>

                    <TableCell>{org.owner.email}</TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Switch
                          checked={org.status === 'active'}
                          disabled={toggleLoadingId === org._id}
                          onChange={() => handleToggleStatus(org)}
                          color="success"
                        />
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color={org.status === 'active' ? 'success.main' : 'text.secondary'}
                        >
                          {org.status === 'active' ? 'Active' : 'Inactive'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={plans.find((p) => p._id === org.planId)?.plan_name || 'No Plan'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedOrganization(org);
                        }}
                        disabled={toggleLoadingId === org._id}
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

        {pagination.total > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <Pagination
              count={Math.ceil(pagination.total / pagination.pageSize)}
              page={pagination.current}
              onChange={(_, value) => setPagination((prev) => ({ ...prev, current: value }))}
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
        open={menuOpen}
        onClose={() => {
          setAnchorEl(null);
          setSelectedOrganization(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          onClick={() => {
            if (selectedOrganization) openEditModal(selectedOrganization);
            setAnchorEl(null);
          }}
          disabled={!selectedOrganization}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            setAnchorEl(null);
          }}
          sx={{ color: 'error.main' }}
          disabled={!selectedOrganization}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* ================= FORM MODAL ================= */}
      <OrganizationFormModal
        open={open}
        loading={submitLoading}
        initialValues={editInitialValues}
        onCancel={() => {
          setOpen(false);
          setEditInitialValues(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* ================= DELETE DIALOG ================= */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>Delete Organization<IconButton onClick={() => setDeleteDialogOpen(false)} size="small">
            <CloseOutlined />
          </IconButton></DialogTitle>
        <DialogContent style={{ paddingTop: 24 }} dividers>
          <Typography>
            Are you sure you want to delete <strong>{selectedOrganization?.name}</strong>? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{
          px: 3,
          py: 2,
          borderColor: 'divider',
        }}>
          <Button onClick={() => setDeleteDialogOpen(false)}
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
          >Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}
            sx={{
              textTransform: 'none',
              borderRadius: '50px',
              px: 3,
              py: 1.25,
              fontWeight: 500,
              boxShadow: 'none',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrganizationManagementPage;

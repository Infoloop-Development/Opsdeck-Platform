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
  Avatar,
  Pagination,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';

import { AddOutlined, MoreVert, Search } from '@mui/icons-material';
import PageHeader from '@/components/PageHeader';
import BlogFormModal from '@/components/BlogFormModal';
import { enqueueSnackbar } from 'notistack';
import api from '@/lib/api/org_client';

const PAGE_SIZE = 10;

interface Blog {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
}

const BlogManagementPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: 0,
  });

  const open = Boolean(anchorEl);

  /* ================= FETCH BLOGS ================= */
  const fetchBlogs = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(search && { search }),
      });

      const response = await api.get(`/superadmin/blogs?${params.toString()}`);

      if (response.data?.success) {
        setBlogs(response.data.blogs || []);

        setPagination((prev) => ({
          ...prev,
          current: response.data.pagination?.page || prev.current,
          pageSize: response.data.pagination?.limit || prev.pageSize,
          total: response.data.pagination?.total || 0,
        }));
      }
    } catch (error: any) {
      enqueueSnackbar({
        message: error.response?.data?.error || 'Failed to fetch blogs',
        variant: 'error',
      });
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  /* ================= MENU ================= */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, blog: Blog) => {
    setAnchorEl(event.currentTarget);
    setSelectedBlog(blog);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  /* ================= CREATE / EDIT ================= */
  const handleOpenCreate = useCallback(() => {
    setSelectedBlog(null);
    setDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback(() => {
    if (!selectedBlog) return;

    setDialogOpen(true);
    handleMenuClose();
  }, [selectedBlog]);

  const handleSubmit = useCallback(
    async (data: any) => {
      setSaving(true);

      try {
        const formData = new FormData();

        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('content', data.content);

        data.categories?.forEach((cat: string) => {
          formData.append('categories', cat);
        });

        data.tags?.forEach((tag: string) => {
          formData.append('tags', tag);
        });

        if (data.thumbnail) {
          // ✅ New file selected — upload it
          formData.append('thumbnail', data.thumbnail);
        } else if (data.existingThumbnail) {
          // ✅ No new file — keep existing thumbnail URL
          formData.append('thumbnail', data.existingThumbnail);
        }
        // If both are null/empty — thumbnail will be removed (intentional)

        if (selectedBlog?._id) {
          await api.put(`/superadmin/blogs/${selectedBlog._id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          enqueueSnackbar({ message: 'Blog updated successfully', variant: 'success' });
        } else {
          await api.post('/superadmin/blogs', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          enqueueSnackbar({ message: 'Blog created successfully', variant: 'success' });
        }

        fetchBlogs();
        setDialogOpen(false);
        setSelectedBlog(null);
      } catch (error: any) {
        enqueueSnackbar({
          message: error.response?.data?.message || 'Failed to save blog',
          variant: 'error',
        });
      } finally {
        setSaving(false);
      }
    },
    [selectedBlog?._id, fetchBlogs]
  );

  /* ================= DELETE ================= */
  const handleDeleteConfirm = async () => {
    if (!selectedBlog?._id) return;

    try {
      await api.delete(`/superadmin/blogs/${selectedBlog._id}`);
      enqueueSnackbar({ message: 'Blog deleted successfully', variant: 'success' });

      setDeleteDialogOpen(false);
      setSelectedBlog(null);
      fetchBlogs();
    } catch (error: any) {
      enqueueSnackbar({
        message: error.response?.data?.error || 'Failed to delete blog',
        variant: 'error',
      });
    }
  };

  if (loading && blogs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: 400, pt: 10 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading blogs...</Typography>
      </Box>
    );
  }

  return (
    <>
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
          title="Blogs"
          action={
            <Stack direction="row" spacing={2} sx={{ width: '100%', alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search Blogs.."
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                Add Blog
              </Button>
            </Stack>
          }
        />
      </Box>
      {/* ================= TABLE (Same Styling as Plans) ================= */}

      <Paper elevation={0} sx={{ borderRadius: '8px', border: '1px solid #EDEFF3' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Blog Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Thumbnail</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {blogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ py: 4 }}>
                      {loading ? 'Loading...' : 'No blogs found'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                blogs.map((blog) => (
                  <TableRow key={blog._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {blog.title?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Typography fontWeight={500} noWrap>
                          {blog.title}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 350,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {blog.description}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      {blog.thumbnail ? (
                        <img
                          src={blog.thumbnail}
                          alt="Blog Thumbnail"
                          style={{
                            width: '200px',
                            height: 'auto',
                            borderRadius: '8px',
                          }}
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>

                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, blog)}>
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

      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem onClick={handleOpenEdit}>Edit</MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Delete Blog</DialogTitle>
        <Box sx={{ px: 3, pb: 2 }}>
          <Typography>
            Are you sure you want to delete <strong>{selectedBlog?.title}</strong>?
          </Typography>
        </Box>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <BlogFormModal
        open={dialogOpen}
        initialValues={selectedBlog}
        loading={saving}
        onCancel={() => {
          setDialogOpen(false);
          setSelectedBlog(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default BlogManagementPage;

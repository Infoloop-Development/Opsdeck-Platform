import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';

const ProjectDeleteDialog = ({
  open,
  onClose,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>Delete Project<IconButton onClick={onClose} size="small">
        <CloseOutlined />
      </IconButton></DialogTitle>
    <DialogContent style={{ paddingTop: 24 }} dividers>
      <DialogContentText>
        Are you sure you want to delete this project? This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions
      sx={{
        px: 3,
        py: 2,
        borderColor: 'divider',
      }}
    >
      <Button onClick={onClose}
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
      <Button onClick={onDelete} variant="contained" color="error" autoFocus
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
        }}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default ProjectDeleteDialog;

'use client';

import React, { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import type ReactQuillType from 'react-quill';

// ✅ Properly typed dynamic import
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => null,
}) as unknown as typeof ReactQuillType;

// ✅ Load Quill CSS only on client
if (typeof window !== 'undefined') {
  require('react-quill/dist/quill.snow.css');
}

/* ================= STYLED CONTAINER ================= */
const EditorContainer = styled(Box)(({ theme }) => ({
  '& .ql-container': {
    fontFamily: theme.typography.fontFamily,
    fontSize: '14px',
    minHeight: '120px',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderBottomLeftRadius: theme.shape.borderRadius,
    borderBottomRightRadius: theme.shape.borderRadius,
    borderColor: theme.palette.divider,
  },

  '& .ql-editor': {
    minHeight: '120px',
    color: theme.palette.text.primary,
    '&.ql-blank::before': {
      fontStyle: 'normal',
      color: theme.palette.text.disabled,
    },
  },

  '& .ql-toolbar': {
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],

    '& .ql-stroke': {
      stroke: theme.palette.text.primary,
    },
    '& .ql-fill': {
      fill: theme.palette.text.primary,
    },
    '& .ql-picker-label': {
      color: theme.palette.text.primary,
    },
  },
}));

/* ================= TYPES ================= */
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/* ================= COMPONENT ================= */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something...',
}) => {
  // ✅ Correct ref typing
  const quillRef = useRef<ReactQuillType | null>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean'],
      ],
      clipboard: { matchVisual: false },
    }),
    []
  );

  const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet'];

  return (
    <EditorContainer>
      <ReactQuill
        ref={quillRef as any} // ✅ final TS-safe cast
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </EditorContainer>
  );
};

export default RichTextEditor;

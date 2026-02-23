'use client';

import React, { useEffect, useMemo, useCallback } from "react";
import { Input } from "antd";
import type { InputProps } from "antd";
import { debounce } from "lodash";

/* ----------------------------------------------------
   Props
---------------------------------------------------- */

interface DebouncedSearchProps {
  onSearch?: (value: string) => void;
  delay?: number;
  placeholder?: string;
  width?: number;
}

/* ----------------------------------------------------
   Component
---------------------------------------------------- */

const DebouncedSearch: React.FC<DebouncedSearchProps> = ({
  onSearch,
  delay = 500,
  placeholder = "Search organizations",
  width = 300,
}) => {
  /* Debounced search handler */
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onSearch?.(value);
      }, delay),
    [onSearch, delay]
  );

  /* Cleanup debounce on unmount */
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChange: InputProps["onChange"] = useCallback(
    (e) => {
      debouncedSearch(e.target.value);
    },
    [debouncedSearch]
  );

  return (
    <Input.Search
      placeholder={placeholder}
      allowClear
      onChange={handleChange}
      style={{ width }}
    />
  );
};

export default DebouncedSearch;

'use client';

import React, { useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";

/* ----------------------------------------------------
   Generic Props
---------------------------------------------------- */

interface CommonSelectProps<T> {
  value?: SelectProps["value"];
  onChange?: SelectProps["onChange"];

  // async function that returns data
  fetcher?: () => Promise<T[]>;

  // optional filter function
  filterFn?: (item: T) => boolean;

  // map item -> { label, value }
  mapOption: (item: T) => {
    label: React.ReactNode;
    value: string | number;
  };

  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
}

/* ----------------------------------------------------
   Component
---------------------------------------------------- */

function CommonSelect<T>({
  value,
  onChange,
  fetcher,
  filterFn,
  mapOption,
  placeholder = "Select",
  disabled = false,
  allowClear = false,
  showSearch = true,
}: CommonSelectProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!fetcher) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetcher();
        setData(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to fetch select data", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetcher]);

  const options = useMemo(() => {
    const filtered = filterFn ? data.filter(filterFn) : data;
    return filtered.map(mapOption);
  }, [data, filterFn, mapOption]);

  return (
    <Select
      showSearch={showSearch}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      loading={loading}
      disabled={disabled}
      allowClear={allowClear}
      options={options}
    />
  );
}

export default CommonSelect;

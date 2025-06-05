// components/SubdistrictSelect.tsx
"use client";

import { useState, useEffect } from "react";

interface Props {
  province: string;
  district: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function SubdistrictSelect({
  province,
  district,
  value,
  onChange,
}: Props) {
  const [subdistricts, setSubdistricts] = useState<string[]>([]);

  useEffect(() => {
    if (!province || !district) {
      setSubdistricts([]);
      return;
    }
    // ดึงตำบลตามจังหวัด+อำเภอ
    fetch(
      `/api/thailand/subdistricts?province=${encodeURIComponent(
        province
      )}&district=${encodeURIComponent(district)}`
    )
      .then((r) => r.json())
      .then((data: { subdistricts: string[] }) => setSubdistricts(data.subdistricts))
      .catch(() => setSubdistricts([]));
  }, [province, district]);

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={!district || subdistricts.length === 0}
      className="flex-1 border p-2 rounded"
    >
      <option value="">-- เลือกตำบล --</option>
      {subdistricts.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

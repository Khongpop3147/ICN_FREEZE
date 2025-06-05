// components/DistrictSelect.tsx
"use client";

import { useState, useEffect } from "react";

interface Props {
  province: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function DistrictSelect({ province, value, onChange }: Props) {
  const [districts, setDistricts] = useState<string[]>([]);

  useEffect(() => {
    if (!province) {
      setDistricts([]);
      return;
    }
    // ดึงอำเภอตามจังหวัด (แทนที่ด้วย path จริงหรือ API ของคุณ)
    fetch(`/api/thailand/districts?province=${encodeURIComponent(province)}`)
      .then((r) => r.json())
      .then((data: { districts: string[] }) => setDistricts(data.districts))
      .catch(() => setDistricts([]));
  }, [province]);

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={!province || districts.length === 0}
      className="flex-1 border p-2 rounded"
    >
      <option value="">-- เลือกอำเภอ --</option>
      {districts.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}

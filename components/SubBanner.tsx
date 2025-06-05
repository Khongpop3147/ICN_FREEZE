// components/SubBanner.tsx
import { useEffect, useState } from "react";

interface SubBannerData {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export default function SubBanner() {
  const [data, setData] = useState<SubBannerData | null>(null);

  useEffect(() => {
    fetch("/api/subbanner")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  return (
    <div className="my-6 p-4 sm:p-6 bg-green-200 rounded-xl flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-6 items-center justify-between">
      <div className="mb-4 md:mb-0">
        <h2 className="text-xl sm:text-2xl font-bold">{data.title}</h2>
        <p className="mt-1 text-sm sm:text-base text-gray-700">
          {data.description}
        </p>
      </div>
      <a
        href={data.buttonLink}
        className="w-full md:w-auto text-center px-4 py-2 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        {data.buttonText}
      </a>
    </div>
  );
}

// pages/products/[id].tsx
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductPageProps {
  product: Product;
}

export default function ProductPage({ product }: ProductPageProps) {
  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={product.imageUrl || "/images/placeholder.png"}
          alt={product.name}
          className="w-full md:w-1/2 h-auto object-cover rounded"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-xl text-green-700 mb-4">
            Price: {product.price} ฿
          </p>
          <p className="mb-4">Stock: {product.stock}</p>
          <Link href="/" className="text-blue-500 hover:underline">
            &larr; กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<ProductPageProps> = async ({
  params,
}) => {
  const id = params?.id as string;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) {
    return { notFound: true };
  }
  // Serialize Date → string
  const product: Product = {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
  return {
    props: { product },
  };
};

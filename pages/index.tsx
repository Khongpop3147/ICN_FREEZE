// pages/index.tsx
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import Banner, { BannerSlide } from "@/components/Banner";
import CategoryCarousel from "@/components/CategoryCarousel";
import DiscountCarousel from "@/components/DiscountCarousel";
import ProductCard from "@/components/ProductCard";
import SubBanner from "@/components/SubBanner";
import { prisma } from "@/lib/prisma";
import { Category, Product } from "@/types/product";

interface HomeProps {
  banners: BannerSlide[]; // Hero banners
  subBanners: BannerSlide[]; // Sub/Promotion banners
  featured: Product[];
  onSale: Product[];
  categories: Category[];
}

export default function HomePage({
  banners,
  subBanners,
  featured,
  onSale,
  categories,
}: HomeProps) {
  const heroSlides: BannerSlide[] = banners;
  const promoSlides: BannerSlide[] = subBanners;

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="mt-16 container py-8">
        <Banner slides={heroSlides} />
      </section>

      {/* Category Carousel */}
      <section className="container">
        <CategoryCarousel categories={categories} />
      </section>

      {/* On Sale Carousel */}
      <section className="container py-8">
        <DiscountCarousel items={onSale} />
      </section>

      {/* Legacy SubBanner Component */}
      <section className="container py-8">
        <SubBanner />
      </section>

      {/* Custom Promotion/Sub Banner */}
      <section className="container py-8">
        <Banner slides={promoSlides} isPromotion />
      </section>

      {/* Featured Products */}
      <section className="container py-8">
        <h2 className="text-xl font-semibold mb-4">สินค้าแนะนำ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // 1. ดึง hero banners (position = "hero")
  const rawHero = await prisma.banner.findMany({
    where: { position: "hero" },
    orderBy: { order: "asc" },
  });
  const banners: BannerSlide[] = rawHero.map((b) => ({
    title: b.title ?? "",
    sub: b.sub ?? "",
    img: b.imageUrl,
  }));

  // 2. ดึง sub/promotional banners (position = "sub")
  const rawSub = await prisma.banner.findMany({
    where: { position: "sub" },
    orderBy: { order: "asc" },
  });
  const subBanners: BannerSlide[] = rawSub.map((b) => ({
    title: b.title ?? "",
    sub: b.sub ?? "",
    img: b.imageUrl,
  }));

  // 3. ดึง featured products (เฉพาะที่ isFeatured = true)
  const rawFeatured = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });
  const featured: Product[] = rawFeatured.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice ?? null,
    isFeatured: p.isFeatured,
  }));

  // 4. ดึง onSale products
  const rawOnSale = await prisma.product.findMany({
    where: { salePrice: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: 8,
  });
  const onSale: Product[] = rawOnSale.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    imageUrl: p.imageUrl,
    stock: p.stock,
    salePrice: p.salePrice!,
    isFeatured: p.isFeatured,
  }));

  // 5. ดึง categories
  const rawCategories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  const categories: Category[] = rawCategories.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return {
    props: { banners, subBanners, featured, onSale, categories },
  };
};

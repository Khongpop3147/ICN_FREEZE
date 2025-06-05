// pages/promotions/[id].tsx
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Layout from "@/components/Layout";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

interface Promotion {
  id: string;
  title: string | null;
  sub: string | null;
  description: string | null;
  imageUrl: string;
}

interface PromotionDetailProps {
  promotion: Promotion | null;
}

const PromotionDetailPage: NextPage<PromotionDetailProps> = ({ promotion }) => {
  if (!promotion) {
    return (
      <Layout title="โปรโมชั่นไม่พบ">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">ไม่พบโปรโมชั่นนี้</h1>
          <p>ขออภัย ไม่พบข้อมูลโปรโมชั่นที่คุณร้องขอ</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>{promotion.title || "รายละเอียดโปรโมชั่น"}</title>
        <meta name="description" content={promotion.sub || ""} />
      </Head>
      <Layout title={promotion.title || "โปรโมชั่น"}>
        <section
          className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg mb-8"
          style={{
            backgroundImage: `url('${promotion.imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center px-4">
              {promotion.title && (
                <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold">
                  {promotion.title}
                </h1>
              )}
              {promotion.sub && (
                <p className="text-white mt-2 text-lg sm:text-xl">
                  {promotion.sub}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-semibold mb-4">รายละเอียดโปรโมชั่น</h2>
          {promotion.description ? (
            <p className="text-gray-700 leading-relaxed">
              {promotion.description}
            </p>
          ) : (
            <p className="text-gray-700">ไม่มีรายละเอียดเพิ่มเติม</p>
          )}
        </section>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<
  PromotionDetailProps
> = async (context) => {
  const id = context.params?.id as string;
  const raw = await prisma.banner.findUnique({
    where: { id },
  });

  if (!raw) {
    return { props: { promotion: null } };
  }

  const promotion: Promotion = {
    id: raw.id,
    title: raw.title,
    sub: raw.sub,
    description: raw.description || null,
    imageUrl: raw.imageUrl,
  };

  return {
    props: { promotion },
  };
};

export default PromotionDetailPage;

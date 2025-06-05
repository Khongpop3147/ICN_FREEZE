// pages/contact.tsx
import Layout from "@/components/Layout";

export default function ContactPage() {
  return (
    <Layout title="ติดต่อเรา">
      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* หัวข้อ */}
        <h1 className="text-2xl font-semibold mb-2">ติดต่อเรา</h1>
        <hr className="border-t-2 border-gray-400 mb-6" />

        {/* ข้อความ */}
        <p className="mb-6 leading-relaxed">
          หากท่านมีข้อสงสัยใดๆ เกี่ยวกับคำสั่งซื้อ
          ท่านสามารถติดต่อแผนกลูกค้าสัมพันธ์ของ ICN_FREEZE ได้ทุกวัน
        </p>

        {/* ช่องทาง Line */}
        <p className="mb-2">
          <span className="font-medium">ผ่านไลน์ Line ID:</span>{" "}
          <span>@XXXXXX</span>{" "}
          <span className="text-gray-600">(เวลา 06:00 – 24:00 น.)</span>
        </p>

        {/* ช่องทางโทรศัพท์ */}
        <p>
          <span className="font-medium">โทรศัพท์:</span>{" "}
          <span>0X-XXXX-XXXX</span>{" "}
          <span className="text-gray-600">(เวลา 06:00 – 24:00 น.)</span>
        </p>
      </div>
    </Layout>
  );
}

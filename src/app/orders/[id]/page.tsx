import type { Metadata } from "next";
import { MyOrderDetail } from "@/components/MyOrderDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Order details",
  description: "View your LuXe Euro order.",
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full px-5 pb-20 pt-28 sm:px-8 lg:px-[200px]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        Account
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink">
        Order details
      </h1>
      <MyOrderDetail orderId={id} />
    </div>
  );
}

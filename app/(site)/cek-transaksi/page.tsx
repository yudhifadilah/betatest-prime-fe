"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock3,
  AlertCircle,
  ShieldCheck,
  Package,
  User,
  ImageIcon,
  ExternalLink,
} from "lucide-react";

type CreatedOrder = {
  id?: number;
  orderId?: string;
  status?: string;
  paymentStatus?: string;
  productType?: string;
  productName?: string;
  buyerName?: string;
  buyerEmail?: string;
  robloxUsername?: string;

  totalPrice?: number;
  totalHarga?: number;
  price?: number;
  harga?: number;
  amount?: number;

  trackingCode?: string;

  completionProof?: string;
  proofDone?: string;
  buktiSelesai?: string;
  adminProof?: string;
  completedProof?: string;

  rolimonsStatus?: string;
  tumbalAvailable?: boolean;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

function CekTransaksiContent() {
  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(orderIdFromUrl);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const getTotalPrice = (order?: CreatedOrder | null) => {
    if (!order) return 0;

    return (
      order.totalPrice ||
      order.totalHarga ||
      order.price ||
      order.harga ||
      order.amount ||
      0
    );
  };

  const getCompletionProof = (order?: CreatedOrder | null) => {
    if (!order) return "";

    return (
      order.completionProof ||
      order.proofDone ||
      order.buktiSelesai ||
      order.adminProof ||
      order.completedProof ||
      ""
    );
  };

  const getFileUrl = (filePath?: string) => {
    if (!filePath) return "";

    if (filePath.startsWith("http")) return filePath;

    if (filePath.startsWith("/uploads")) {
      return `${API_URL}${filePath}`;
    }

    if (filePath.startsWith("uploads")) {
      return `${API_URL}/${filePath}`;
    }

    return `${API_URL}/uploads/${filePath}`;
  };

  const isImageFile = (filePath?: string) => {
    if (!filePath) return false;

    const value = filePath.toLowerCase();

    return (
      value.endsWith(".jpg") ||
      value.endsWith(".jpeg") ||
      value.endsWith(".png") ||
      value.endsWith(".webp") ||
      value.endsWith(".gif")
    );
  };

  const formatRupiah = (value?: number) => {
    if (!value) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status?: string) => {
    const value = status?.toLowerCase();

    if (value === "completed" || value === "selesai") {
      return "text-emerald-400 bg-emerald-500/10 border-emerald-400/20";
    }

    if (value === "processing" || value === "diproses") {
      return "text-cyan-400 bg-cyan-500/10 border-cyan-400/20";
    }

    if (value === "cancelled" || value === "dibatalkan") {
      return "text-red-400 bg-red-500/10 border-red-400/20";
    }

    return "text-yellow-300 bg-yellow-500/10 border-yellow-400/20";
  };

  const checkOrder = async (id: string) => {
    if (!id.trim()) {
      alert("Masukkan Order ID terlebih dahulu");
      return;
    }

    try {
      setLoading(true);
      setHasChecked(true);
      setOrder(null);

      const cleanOrderId = id.trim();

      const res = await fetch(
        `${API_URL}/api/check-order/${encodeURIComponent(cleanOrderId)}`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const text = await res.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Response server bukan JSON");
      }

      if (!res.ok || !data?.success) {
        setOrder(null);
        return;
      }

      setOrder(data.data);
    } catch (error) {
      console.error("Gagal mengecek transaksi:", error);
      alert(
        error instanceof Error ? error.message : "Gagal mengecek transaksi"
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdFromUrl) {
      checkOrder(orderIdFromUrl);
    }
  }, [orderIdFromUrl]);

  const totalPrice = getTotalPrice(order);
  const completionProof = getCompletionProof(order);
  const completionProofUrl = getFileUrl(completionProof);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-5 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <section className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-white/[0.04] shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(6,182,212,0.18),transparent_38%)]" />

          <div className="relative px-6 py-8 md:px-8 md:py-10">
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300">
              🔎 Cek Transaksi
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl">
              Cek Status Order
              <span className="block text-cyan-400">Cepat & Mudah</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
              Masukkan Order ID untuk melihat semua status transaksi kamu,
              termasuk Vilog, Payout, Gifting, dan Item Limited.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                <ShieldCheck size={18} />
                <span className="font-semibold">Aman</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                <Clock3 size={18} />
                <span className="font-semibold">Realtime Check</span>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                <CreditCard size={18} />
                <span className="font-semibold">All Order ID</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[30px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
          <h2 className="text-2xl font-extrabold text-white">
            Masukkan Order ID
          </h2>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10">
              <Search size={20} className="text-cyan-400" />

              <input
                type="text"
                placeholder="Contoh: ORDER-123456 / LIMS-123456"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") checkOrder(orderId);
                }}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>

            <button
              type="button"
              onClick={() => checkOrder(orderId)}
              disabled={loading}
              className="rounded-2xl bg-cyan-500 px-8 py-3 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              {loading ? "Mengecek..." : "Cek Transaksi"}
            </button>
          </div>
        </section>

        {order && (
          <section className="mt-10 rounded-[30px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <h2 className="flex items-center gap-2 text-2xl font-extrabold text-white">
              <CreditCard size={26} className="text-cyan-400" />
              Detail Transaksi
            </h2>

            <div className="mt-6 space-y-4">
              <InfoRow label="Order ID" value={order.orderId || "-"} />

              {order.trackingCode && (
                <InfoRow label="Tracking Code" value={order.trackingCode} />
              )}

              <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                <span className="text-sm text-gray-400">Status</span>
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-bold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status || "pending"}
                </span>
              </div>

              {order.paymentStatus && (
                <InfoRow
                  label="Status Pembayaran"
                  value={order.paymentStatus}
                />
              )}

              {order.productType && (
                <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <Package size={17} />
                    Jenis Produk
                  </span>
                  <span className="text-right text-sm font-bold uppercase text-cyan-400">
                    {order.productType}
                  </span>
                </div>
              )}

              {order.productName && (
                <InfoRow label="Nama Produk" value={order.productName} />
              )}

              {order.robloxUsername && (
                <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <User size={17} />
                    Roblox Username
                  </span>
                  <span className="text-right text-sm font-bold text-cyan-400">
                    {order.robloxUsername}
                  </span>
                </div>
              )}

              <InfoRow label="Total Harga" value={formatRupiah(totalPrice)} />

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                    <ImageIcon size={17} />
                    Bukti Pesanan Selesai
                  </span>

                  {completionProofUrl ? (
                    <a
                      href={completionProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-[#07111f] transition hover:bg-emerald-400"
                    >
                      Lihat Bukti
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span className="text-sm font-bold text-yellow-300">
                      Belum dikirim admin
                    </span>
                  )}
                </div>

                {completionProofUrl && isImageFile(completionProofUrl) && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <img
                      src={completionProofUrl}
                      alt="Bukti Pesanan Selesai"
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>
                )}
              </div>

              {order.rolimonsStatus && (
                <InfoRow label="Rolimons" value={order.rolimonsStatus} />
              )}

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5 text-emerald-300">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={22} />
                  Transaksi ditemukan
                </div>

                <p className="mt-2 text-sm text-emerald-200/80">
                  Simpan Order ID ini untuk mengecek status transaksi kamu
                  kembali.
                </p>
              </div>
            </div>
          </section>
        )}

        {!order && orderId && hasChecked && !loading && (
          <section className="mt-10 rounded-[30px] border border-red-400/20 bg-red-500/10 p-5 text-red-300 shadow-xl shadow-red-500/10 backdrop-blur-md">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle size={22} />
              Transaksi belum ditemukan
            </div>

            <p className="mt-2 text-sm text-red-200/80">
              Pastikan Order ID sudah benar.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-right text-sm font-bold text-cyan-400">
        {value}
      </span>
    </div>
  );
}

export default function CekTransaksiPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#07111f] px-5 py-8 text-white">
          <div className="mx-auto max-w-4xl rounded-[30px] border border-cyan-500/20 bg-white/[0.04] p-6">
            Loading cek transaksi...
          </div>
        </main>
      }
    >
      <CekTransaksiContent />
    </Suspense>
  );
}
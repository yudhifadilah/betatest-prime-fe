"use client";

import { ShoppingCart, CreditCard, CheckCircle2, QrCode, Landmark, AlertCircle, Upload } from "lucide-react";
import LimsUpload from "@/components/lims/LimsUpload";
import { LimsPackage } from "@/app/types/lims";

type SelectedLimsPackage = LimsPackage & {
  kategori: "limited" | "tumbal";
};

type Rekening = {
  id: number;
  metodePembayaran: "BANK" | "QRIS" | string;
  namaBank?: string;
  nomorRekening?: string;
  namaPemilik?: string;
  qrisImage?: string;
  isActive?: boolean;
};

type CreatedOrder = {
  id?: number;
  orderId?: string;
  status?: string;
};

type Props = {
  form: {
    robloxUsername: string;
    nomorRekening: string;
  };
  setForm: (value: { robloxUsername: string; nomorRekening: string }) => void;
  selectedPackage: SelectedLimsPackage;
  paymentProof: File | null;
  paymentPreview: string | null;
  setPaymentProof: (file: File | null) => void;
  setPaymentPreview: (preview: string | null) => void;
  loadingOrder: boolean;
  onSubmit: () => void;

  paymentMethods?: Rekening[];
  selectedPaymentId?: string;
  setSelectedPaymentId?: (value: string) => void;
  loadingPayments?: boolean;
  onRefreshPayments?: () => void;
  createdOrder?: CreatedOrder | null;
  onNewOrder?: () => void;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export default function FormDataOrderLims({
  form,
  setForm,
  selectedPackage,
  paymentProof,
  paymentPreview,
  setPaymentProof,
  setPaymentPreview,
  loadingOrder,
  onSubmit,
  paymentMethods = [],
  selectedPaymentId = "",
  setSelectedPaymentId,
  loadingPayments = false,
  onRefreshPayments,
  createdOrder = null,
  onNewOrder,
}: Props) {
  const packageLabel =
    selectedPackage.kategori === "limited" ? "Item Limited" : "Item Tumbal";

  const selectedPayment = paymentMethods.find(
    (item) => String(item.id) === String(selectedPaymentId)
  );

  const getFileUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_URL}/${cleanPath}`;
  };

  if (createdOrder) {
    return (
      <section className="mt-10 rounded-[32px] border border-cyan-500/20 bg-white/[0.04] p-6 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-md">
        <div className="text-center">
          <CheckCircle2 className="mx-auto text-cyan-400" size={64} />
          <h2 className="mt-4 text-3xl font-extrabold text-white">Invoice Order LIMS</h2>
          <p className="mt-2 text-sm text-gray-400">
            Order berhasil dibuat. Simpan Order ID untuk cek transaksi.
          </p>
        </div>

        <div className="mt-8 space-y-3 text-sm">
          <InvoiceRow label="Order ID" value={createdOrder.orderId || "-"} />
          <InvoiceRow label="Status" value={createdOrder.status || "pending"} />
          <InvoiceRow label="Kategori" value={packageLabel} />
          <InvoiceRow label="Item" value={selectedPackage.namaItem || "-"} />
          <InvoiceRow label="Asset ID" value={String(selectedPackage.assetId || "-")} />
          <InvoiceRow label="Username Roblox" value={form.robloxUsername || "-"} />
          <InvoiceRow
            label="Harga"
            value={`Rp ${Number(selectedPackage.harga || 0).toLocaleString("id-ID")}`}
          />
          <InvoiceRow
            label="Metode Pembayaran"
            value={
              selectedPayment?.metodePembayaran === "QRIS"
                ? "QRIS"
                : `${selectedPayment?.namaBank || "BANK"} - ${selectedPayment?.nomorRekening || "-"}`
            }
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              if (createdOrder.orderId) {
                window.location.href = `/cek-transaksi?orderId=${createdOrder.orderId}`;
              }
            }}
            className="flex-1 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-extrabold text-[#07111f] transition hover:bg-cyan-400"
          >
            Cek Transaksi
          </button>

          <button
            type="button"
            onClick={onNewOrder}
            className="flex-1 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Buat Order Baru
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="form-order-lims"
      className="mt-10 rounded-[30px] border border-cyan-500/20 bg-white/[0.04] p-5 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-md"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Form Order LIMS</h2>

          <p className="mt-2 text-sm text-gray-400">
            Paket dipilih: <span className="font-bold text-cyan-400">{packageLabel}</span>
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Item dipilih: <span className="font-bold text-cyan-400">{selectedPackage.namaItem}</span>
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Asset ID: <span className="font-bold text-cyan-400">{selectedPackage.assetId}</span>
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-lg shadow-cyan-500/30">
          Rp {Number(selectedPackage.harga).toLocaleString("id-ID")}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <input
          type="text"
          placeholder="Username Roblox"
          value={form.robloxUsername}
          onChange={(e) => setForm({ ...form, robloxUsername: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/80 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
        />

        <input
          type="text"
          placeholder="Nomor Rekening / E-Wallet Pengirim"
          value={form.nomorRekening}
          onChange={(e) => setForm({ ...form, nomorRekening: e.target.value })}
          className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/80 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
        />

        <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-500/5 p-4">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-extrabold text-white">Pilih Metode Pembayaran</h3>
              <p className="mt-1 text-sm text-gray-400">
                Pilih rekening bank atau QRIS yang tersedia.
              </p>
            </div>

            {onRefreshPayments && (
              <button
                type="button"
                onClick={onRefreshPayments}
                disabled={loadingPayments}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-[#07111f] disabled:opacity-50"
              >
                {loadingPayments ? "Loading..." : "Refresh Metode"}
              </button>
            )}
          </div>

          {loadingPayments ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
              Loading metode pembayaran...
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              Belum ada metode pembayaran aktif. Hubungi admin.
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {paymentMethods.map((method) => {
                  const active = String(selectedPaymentId) === String(method.id);
                  const isQris = method.metodePembayaran === "QRIS";

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentId?.(String(method.id))}
                      className={`rounded-[22px] border p-4 text-left transition hover:-translate-y-1 ${
                        active
                          ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                          : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                            isQris
                              ? "bg-orange-500/15 text-orange-300"
                              : "bg-cyan-500/15 text-cyan-300"
                          }`}
                        >
                          {isQris ? <QrCode size={22} /> : <Landmark size={22} />}
                        </div>

                        <div>
                          <p className="text-sm font-extrabold text-white">
                            {isQris ? "QRIS" : method.namaBank || "BANK"}
                          </p>

                          <p className="text-xs text-gray-400">
                            {isQris ? "Scan QR untuk pembayaran" : method.namaPemilik || "-"}
                          </p>
                        </div>
                      </div>

                      {!isQris && (
                        <div className="mt-4 rounded-2xl bg-black/20 px-4 py-3">
                          <p className="text-xs text-gray-400">Nomor Rekening</p>
                          <p className="mt-1 text-sm font-bold text-cyan-300">
                            {method.nomorRekening || "-"}
                          </p>
                        </div>
                      )}

                      {isQris && method.qrisImage && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                          <img
                            src={getFileUrl(method.qrisImage)}
                            alt="QRIS"
                            className="h-44 w-full object-contain"
                          />
                        </div>
                      )}

                      {active && (
                        <div className="mt-4 flex items-center gap-2 text-sm font-bold text-cyan-300">
                          <CheckCircle2 size={18} />
                          Metode dipilih
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedPayment && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <p className="text-sm font-bold text-emerald-300">Instruksi Pembayaran</p>

                  {selectedPayment.metodePembayaran === "QRIS" ? (
                    <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                      Scan QRIS di atas sesuai nominal{" "}
                      <span className="font-bold text-white">
                        Rp {Number(selectedPackage.harga).toLocaleString("id-ID")}
                      </span>
                      , lalu upload bukti pembayaran.
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <PaymentInfo label="Bank" value={selectedPayment.namaBank || "-"} />
                      <PaymentInfo label="Nomor" value={selectedPayment.nomorRekening || "-"} />
                      <PaymentInfo label="Pemilik" value={selectedPayment.namaPemilik || "-"} />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="rounded-[24px] border-2 border-dashed border-cyan-400/30 bg-cyan-500/5 p-4">
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-white">
            <Upload size={20} className="text-cyan-400" />
            Upload Bukti Pembayaran
          </h3>

          <div className="mt-4">
            <LimsUpload
              paymentProof={paymentProof}
              paymentPreview={paymentPreview}
              onChange={(file, preview) => {
                setPaymentProof(file);
                setPaymentPreview(preview);
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loadingOrder}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          <ShoppingCart size={20} />
          {loadingOrder ? "Membuat Order..." : "Buat Order LIMS"}
        </button>
      </div>
    </section>
  );
}

function PaymentInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 px-4 py-3">
      <p className="text-xs text-emerald-200/70">{label}</p>
      <p className="mt-1 break-all text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function InvoiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="break-all text-sm font-bold text-cyan-300">{value}</span>
    </div>
  );
}

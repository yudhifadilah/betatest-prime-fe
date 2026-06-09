"use client";

import { ShoppingCart } from "lucide-react";
import LimsUpload from "@/components/lims/LimsUpload";
import { LimsPackage } from "@/app/types/lims";

type SelectedLimsPackage = LimsPackage & {
  kategori: "limited" | "tumbal";
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
};

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
}: Props) {
  const packageLabel =
    selectedPackage.kategori === "limited" ? "Item Limited" : "Item Tumbal";

  return (
    <section
      id="form-order-lims"
      className="mt-10 rounded-[32px] bg-white p-6 shadow-lg"
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-2xl font-bold text-black">Form Order LIMS</h2>

          <p className="mt-2 text-neutral-500">
            Paket dipilih:{" "}
            <span className="font-bold text-black">{packageLabel}</span>
          </p>

          <p className="mt-1 text-neutral-500">
            Item dipilih:{" "}
            <span className="font-bold text-black">
              {selectedPackage.namaItem}
            </span>
          </p>

          <p className="mt-1 text-neutral-500">
            Asset ID:{" "}
            <span className="font-bold text-black">
              {selectedPackage.assetId}
            </span>
          </p>
        </div>

        <div className="rounded-2xl bg-black px-5 py-3 font-bold text-white">
          Rp {Number(selectedPackage.harga).toLocaleString("id-ID")}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <input
          type="text"
          placeholder="Username Roblox"
          value={form.robloxUsername}
          onChange={(e) =>
            setForm({ ...form, robloxUsername: e.target.value })
          }
          className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
        />

        <input
          type="text"
          placeholder="Nomor Rekening / E-Wallet Pengirim"
          value={form.nomorRekening}
          onChange={(e) =>
            setForm({ ...form, nomorRekening: e.target.value })
          }
          className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
        />

        <LimsUpload
          paymentProof={paymentProof}
          paymentPreview={paymentPreview}
          onChange={(file, preview) => {
            setPaymentProof(file);
            setPaymentPreview(preview);
          }}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={loadingOrder}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <ShoppingCart size={20} />
          {loadingOrder ? "Membuat Order..." : "Buat Order LIMS"}
        </button>
      </div>
    </section>
  );
}
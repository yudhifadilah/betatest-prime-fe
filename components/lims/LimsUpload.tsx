"use client";

import { CheckCircle2, Upload } from "lucide-react";

type Props = {
  paymentProof: File | null;
  paymentPreview: string | null;
  onChange: (file: File, preview: string) => void;
};

export default function LimsUpload({
  paymentProof,
  paymentPreview,
  onChange,
}: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("File harus berupa PNG, JPG, JPEG, atau WEBP");
      return;
    }

    onChange(file, URL.createObjectURL(file));
  };

  return (
    <div className="rounded-[28px] border border-dashed border-neutral-300 p-5">
      <h3 className="text-xl font-bold text-black">Upload Bukti Pembayaran</h3>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[24px] bg-neutral-50 p-8 text-center transition hover:bg-neutral-100">
        <Upload size={40} className="text-neutral-500" />

        <p className="mt-3 font-semibold text-black">
          Upload screenshot pembayaran
        </p>

        <p className="mt-1 text-sm text-neutral-500">
          PNG, JPG, JPEG, atau WEBP
        </p>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {paymentPreview && (
        <div className="mt-5 overflow-hidden rounded-3xl border border-neutral-200">
          <img
            src={paymentPreview}
            alt="Preview bukti pembayaran"
            className="max-h-80 w-full bg-neutral-100 object-contain"
          />
        </div>
      )}

      {paymentProof && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
          <CheckCircle2 size={20} />
          <span className="font-semibold">{paymentProof.name}</span>
        </div>
      )}
    </div>
  );
}
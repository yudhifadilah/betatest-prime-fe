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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "File harus berupa PNG, JPG, JPEG, atau WEBP"
      );
      return;
    }

    onChange(file, URL.createObjectURL(file));
  };

  return (
    <div className="rounded-[24px] border-2 border-dashed border-cyan-400/30 bg-cyan-500/5 p-4">
      <h3 className="text-lg font-extrabold text-white">
        Upload Bukti Pembayaran
      </h3>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] p-6 text-center transition hover:bg-cyan-500/10">
        <Upload
          size={34}
          className="text-cyan-400"
        />

        <p className="mt-3 text-sm font-bold text-white">
          Upload screenshot pembayaran
        </p>

        <p className="mt-1 text-xs text-gray-400">
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
        <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1627]">
          <img
            src={paymentPreview}
            alt="Preview bukti pembayaran"
            className="max-h-72 w-full object-contain"
          />
        </div>
      )}

      {paymentProof && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          <CheckCircle2 size={18} />
          <span className="font-bold">
            {paymentProof.name}
          </span>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Save,
  QrCode,
  RefreshCcw,
  CheckCircle2,
  XCircle,
  Landmark,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

type Rekening = {
  id: number;
  metodePembayaran: string;
  namaBank?: string;
  nomorRekening?: string;
  namaPemilik?: string;
  qrisImage?: string;
  isActive?: boolean;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export default function RekeningPage() {
  const [data, setData] = useState<Rekening[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState<Rekening | null>(null);
  const [preview, setPreview] = useState("");
  const [qrisImage, setQrisImage] = useState<File | null>(null);

  const [form, setForm] = useState({
    metodePembayaran: "BANK",
    namaBank: "",
    nomorRekening: "",
    namaPemilik: "",
    isActive: true,
  });

  const isBank = form.metodePembayaran === "BANK";
  const isQris = form.metodePembayaran === "QRIS";

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const getFileUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_URL}/${cleanPath}`;
  };

  const safeJson = async (res: Response, fallbackUrl?: string) => {
    const text = await res.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        fallbackUrl
          ? `Response bukan JSON dari: ${fallbackUrl}`
          : "Response server bukan JSON"
      );
    }
  };

  const resetForm = () => {
    setEditing(null);
    setPreview("");
    setQrisImage(null);
    setForm({
      metodePembayaran: "BANK",
      namaBank: "",
      nomorRekening: "",
      namaPemilik: "",
      isActive: true,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const url = `${API_URL}/api/rekening`;

      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await safeJson(res, url);

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil data rekening");
      }

      setData(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data rekening"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMetodeChange = (value: string) => {
    if (value === "BANK") {
      setPreview("");
      setQrisImage(null);
      setForm({
        ...form,
        metodePembayaran: "BANK",
      });
      return;
    }

    if (value === "QRIS") {
      setForm({
        ...form,
        metodePembayaran: "QRIS",
        namaBank: "",
        nomorRekening: "",
        namaPemilik: "",
      });
    }
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("File harus berupa PNG, JPG, JPEG, atau WEBP");
      return;
    }

    setQrisImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.metodePembayaran) {
      alert("Metode pembayaran wajib dipilih");
      return;
    }

    if (isBank) {
      if (!form.namaBank || !form.nomorRekening || !form.namaPemilik) {
        alert("Nama bank, nomor rekening, dan nama pemilik wajib diisi");
        return;
      }
    }

    if (isQris && !qrisImage && !preview) {
      alert("Gambar QRIS wajib diupload");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("metodePembayaran", form.metodePembayaran);
      formData.append("isActive", String(form.isActive));

      if (isBank) {
        formData.append("namaBank", form.namaBank);
        formData.append("nomorRekening", form.nomorRekening);
        formData.append("namaPemilik", form.namaPemilik);
      }

      if (isQris && qrisImage) {
        formData.append("qrisImage", qrisImage);
      }

      const url = editing
        ? `${API_URL}/api/rekening/${editing.id}`
        : `${API_URL}/api/rekening`;

      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      const json = await safeJson(res, url);

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan rekening");
      }

      resetForm();
      await loadData();

      alert(
        editing
          ? "Metode pembayaran berhasil diupdate"
          : "Metode pembayaran berhasil ditambahkan"
      );
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal menyimpan rekening"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: Rekening) => {
    setEditing(item);

    setForm({
      metodePembayaran: item.metodePembayaran || "BANK",
      namaBank: item.namaBank || "",
      nomorRekening: item.nomorRekening || "",
      namaPemilik: item.namaPemilik || "",
      isActive: item.isActive !== false,
    });

    setPreview(item.qrisImage ? getFileUrl(item.qrisImage) : "");
    setQrisImage(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Yakin ingin menghapus metode pembayaran ini?"
    );

    if (!confirmDelete) return;

    try {
      const url = `${API_URL}/api/rekening/${id}`;

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await safeJson(res, url);

      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus rekening");
      }

      await loadData();
      alert("Metode pembayaran berhasil dihapus");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal menghapus rekening"
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalActive = data.filter((item) => item.isActive !== false).length;
  const totalInactive = data.filter((item) => item.isActive === false).length;
  const totalQris = data.filter(
    (item) => item.metodePembayaran === "QRIS"
  ).length;
  const totalBank = data.filter(
    (item) => item.metodePembayaran === "BANK"
  ).length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-5 pb-10 pt-24 text-white md:px-8 md:pt-8">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[34px] border border-cyan-500/20 bg-white/[0.04] shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(6,182,212,0.18),transparent_38%)]" />

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                  <CreditCard size={18} />
                  Payment Management
                </div>

                <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                  Metode Pembayaran
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                  Kelola rekening bank dan QRIS agar pelanggan bisa melakukan
                  pembayaran dengan mudah, aman, dan cepat.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300">
                    <ShieldCheck size={18} />
                    Aman
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300">
                    <Landmark size={18} />
                    Bank
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300">
                    <QrCode size={18} />
                    QRIS
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                <RefreshCcw size={18} />
                {loading ? "Loading..." : "Refresh Data"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Metode"
            value={data.length}
            icon={<CreditCard size={24} />}
            variant="cyan"
          />
          <StatCard
            title="BANK"
            value={totalBank}
            icon={<Landmark size={24} />}
            variant="blue"
          />
          <StatCard
            title="QRIS"
            value={totalQris}
            icon={<QrCode size={24} />}
            variant="orange"
          />
          <StatCard
            title="Aktif"
            value={totalActive}
            icon={<CheckCircle2 size={24} />}
            variant="emerald"
          />
          <StatCard
            title="Tidak Aktif"
            value={totalInactive}
            icon={<XCircle size={24} />}
            variant="red"
          />
        </section>

        <section className="rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-white">
                <Plus size={26} className="text-cyan-400" />
                {editing ? "Edit Pembayaran" : "Tambah Pembayaran"}
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Pilih metode pembayaran. Form akan otomatis menyesuaikan.
              </p>
            </div>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-[#07111f]"
              >
                <X size={18} />
                Batal Edit
              </button>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-300">
                    Metode Pembayaran
                  </label>

                  <select
                    value={form.metodePembayaran}
                    onChange={(e) => handleMetodeChange(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  >
                    <option className="bg-[#0b1627]" value="BANK">
                      BANK
                    </option>
                    <option className="bg-[#0b1627]" value="QRIS">
                      QRIS
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-300">
                    Status
                  </label>

                  <select
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isActive: e.target.value === "active",
                      })
                    }
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  >
                    <option className="bg-[#0b1627]" value="active">
                      Aktif
                    </option>
                    <option className="bg-[#0b1627]" value="inactive">
                      Tidak Aktif
                    </option>
                  </select>
                </div>
              </div>

              {isBank && (
                <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/5 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                      <Landmark size={24} />
                    </div>

                    <div>
                      <h3 className="font-black text-white">Data Rekening</h3>
                      <p className="text-sm text-gray-400">
                        Isi informasi rekening bank atau e-wallet.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                      label="Nama Bank / E-Wallet"
                      placeholder="Contoh: BCA / BRI / DANA"
                      value={form.namaBank}
                      onChange={(value) =>
                        setForm({
                          ...form,
                          namaBank: value,
                        })
                      }
                    />

                    <InputField
                      label="Nomor Rekening"
                      placeholder="Masukkan nomor rekening"
                      value={form.nomorRekening}
                      onChange={(value) =>
                        setForm({
                          ...form,
                          nomorRekening: value,
                        })
                      }
                    />

                    <div className="md:col-span-2">
                      <InputField
                        label="Nama Pemilik"
                        placeholder="Nama pemilik rekening"
                        value={form.namaPemilik}
                        onChange={(value) =>
                          setForm({
                            ...form,
                            namaPemilik: value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {isQris && (
                <div className="rounded-[28px] border border-orange-400/20 bg-orange-500/10 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-300">
                      <QrCode size={24} />
                    </div>

                    <div>
                      <h3 className="font-black text-white">Upload QRIS</h3>
                      <p className="text-sm text-gray-400">
                        Upload gambar QRIS yang akan digunakan pelanggan.
                      </p>
                    </div>
                  </div>

                  <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-orange-300/30 bg-white/[0.04] px-5 py-6 text-center font-bold text-gray-300 transition hover:border-orange-300 hover:bg-orange-500/10 hover:text-white">
                    <Upload size={34} className="mb-3 text-orange-300" />
                    Pilih Gambar QRIS
                    <span className="mt-1 text-xs font-medium text-gray-500">
                      PNG, JPG, JPEG, atau WEBP
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50 md:w-fit"
              >
                <Save size={20} />
                {saving
                  ? "Menyimpan..."
                  : editing
                  ? "Update Pembayaran"
                  : "Tambah Pembayaran"}
              </button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <h3 className="text-lg font-black text-white">Preview</h3>
              <p className="mt-1 text-sm text-gray-400">
                Tampilan ringkas metode pembayaran yang sedang dibuat.
              </p>

              <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0b1627]/70 p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                      isQris
                        ? "bg-orange-500/15 text-orange-300"
                        : "bg-cyan-500/15 text-cyan-300"
                    }`}
                  >
                    {isQris ? <QrCode size={24} /> : <Landmark size={24} />}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                      {form.metodePembayaran}
                    </p>
                    <h4 className="font-black text-white">
                      {isQris
                        ? "QRIS Payment"
                        : form.namaBank || "Nama Bank"}
                    </h4>
                  </div>
                </div>

                {isBank && (
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                      <span className="text-gray-400">Nomor</span>
                      <span className="font-bold text-white">
                        {form.nomorRekening || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 rounded-2xl bg-black/20 px-4 py-3">
                      <span className="text-gray-400">Pemilik</span>
                      <span className="font-bold text-white">
                        {form.namaPemilik || "-"}
                      </span>
                    </div>
                  </div>
                )}

                {isQris && (
                  <div className="mt-5">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Preview QRIS"
                        className="h-64 w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.04] text-sm font-semibold text-gray-500">
                        Belum ada QRIS
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5">
                  {form.isActive ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-300">
                      <CheckCircle2 size={16} />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-sm font-bold text-red-300">
                      <XCircle size={16} />
                      Tidak Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                Daftar Pembayaran
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Total: {data.length} metode pembayaran
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-[#07111f] disabled:opacity-50"
            >
              <RefreshCcw size={18} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-gray-400">
              Loading data pembayaran...
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-gray-400">
              Belum ada metode pembayaran.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.map((item) => {
                const itemIsQris = item.metodePembayaran === "QRIS";

                return (
                  <div
                    key={item.id}
                    className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-500/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            itemIsQris
                              ? "bg-orange-500/15 text-orange-300"
                              : "bg-cyan-500/15 text-cyan-300"
                          }`}
                        >
                          {itemIsQris ? (
                            <QrCode size={24} />
                          ) : (
                            <Landmark size={24} />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                            {item.metodePembayaran}
                          </p>
                          <h3 className="font-black text-white">
                            {itemIsQris
                              ? "QRIS Payment"
                              : item.namaBank || "-"}
                          </h3>
                        </div>
                      </div>

                      {item.isActive === false ? (
                        <span className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">
                          Off
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          Aktif
                        </span>
                      )}
                    </div>

                    {itemIsQris ? (
                      <div className="mt-5">
                        {item.qrisImage ? (
                          <img
                            src={getFileUrl(item.qrisImage)}
                            alt="QRIS"
                            className="h-48 w-full rounded-2xl bg-black/20 object-contain"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center rounded-2xl bg-black/20 text-sm font-semibold text-gray-500">
                            Tidak ada gambar QRIS
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 space-y-3 text-sm">
                        <div className="rounded-2xl bg-black/20 px-4 py-3">
                          <p className="text-xs font-bold text-gray-500">
                            Nomor Rekening
                          </p>
                          <p className="mt-1 break-all font-black text-white">
                            {item.nomorRekening || "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-black/20 px-4 py-3">
                          <p className="text-xs font-bold text-gray-500">
                            Nama Pemilik
                          </p>
                          <p className="mt-1 font-black text-white">
                            {item.namaPemilik || "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#07111f] shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-400"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  variant,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  variant: "cyan" | "blue" | "orange" | "emerald" | "red";
}) {
  const styles: Record<typeof variant, string> = {
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    blue: "border-blue-400/20 bg-blue-500/10 text-blue-300",
    orange: "border-orange-400/20 bg-orange-500/10 text-orange-300",
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    red: "border-red-400/20 bg-red-500/10 text-red-300",
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-cyan-500/5 backdrop-blur-md transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-500/5">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${styles[variant]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-400">{title}</p>
      <h2 className="mt-1 text-3xl font-black text-white">{value}</h2>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-gray-300">
        {label}
      </label>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
      />
    </div>
  );
}

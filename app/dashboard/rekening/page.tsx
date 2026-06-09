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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

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

      const res = await fetch(`${API_URL}/api/rekening`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const text = await res.text();

      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Response bukan JSON dari: ${API_URL}/api/rekening`);
      }

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

      const text = await res.text();

      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Response bukan JSON dari: ${url}`);
      }

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

    setPreview(item.qrisImage ? `${API_URL}${item.qrisImage}` : "");
    setQrisImage(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Yakin ingin menghapus metode pembayaran ini?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/rekening/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const text = await res.text();

      let json: any = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Response bukan JSON saat menghapus rekening");
      }

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
    <main className="min-h-screen bg-neutral-100 px-5 pb-10 pt-24 md:px-8 md:pt-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[34px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative p-6 md:p-8">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-black/5 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                  <CreditCard size={18} />
                  Payment Management
                </div>

                <h1 className="mt-5 text-4xl font-black text-black md:text-5xl">
                  Metode Pembayaran
                </h1>

                <p className="mt-3 max-w-2xl text-neutral-500">
                  Kelola rekening bank dan QRIS agar pelanggan bisa melakukan
                  pembayaran dengan mudah.
                </p>
              </div>

              <button
                type="button"
                onClick={loadData}
                className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-bold text-white transition hover:opacity-90"
              >
                <RefreshCcw size={18} />
                Refresh Data
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Metode"
            value={data.length}
            icon={<CreditCard size={24} />}
            className="bg-black text-white"
          />
          <StatCard
            title="BANK"
            value={totalBank}
            icon={<Landmark size={24} />}
            className="bg-blue-600 text-white"
          />
          <StatCard
            title="QRIS"
            value={totalQris}
            icon={<QrCode size={24} />}
            className="bg-orange-500 text-white"
          />
          <StatCard
            title="Aktif"
            value={totalActive}
            icon={<CheckCircle2 size={24} />}
            className="bg-emerald-600 text-white"
          />
          <StatCard
            title="Tidak Aktif"
            value={totalInactive}
            icon={<XCircle size={24} />}
            className="bg-red-500 text-white"
          />
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-black">
                <Plus size={26} />
                {editing ? "Edit Pembayaran" : "Tambah Pembayaran"}
              </h2>

              <p className="mt-1 text-neutral-500">
                Pilih metode pembayaran. Form akan otomatis menyesuaikan.
              </p>
            </div>

            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 font-bold text-black transition hover:bg-neutral-200"
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
                  <label className="mb-2 block text-sm font-bold text-black">
                    Metode Pembayaran
                  </label>

                  <select
                    value={form.metodePembayaran}
                    onChange={(e) => handleMetodeChange(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
                  >
                    <option value="BANK">BANK</option>
                    <option value="QRIS">QRIS</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-black">
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
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
              </div>

              {isBank && (
                <div className="rounded-[28px] border border-blue-100 bg-blue-50/60 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <Landmark size={24} />
                    </div>

                    <div>
                      <h3 className="font-black text-black">Data Rekening</h3>
                      <p className="text-sm text-neutral-500">
                        Isi informasi rekening bank atau e-wallet.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-black">
                        Nama Bank / E-Wallet
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: BCA / BRI / DANA"
                        value={form.namaBank}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            namaBank: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-black outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-black">
                        Nomor Rekening
                      </label>
                      <input
                        type="text"
                        placeholder="Masukkan nomor rekening"
                        value={form.nomorRekening}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            nomorRekening: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-black outline-none focus:border-black"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-bold text-black">
                        Nama Pemilik
                      </label>
                      <input
                        type="text"
                        placeholder="Nama pemilik rekening"
                        value={form.namaPemilik}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            namaPemilik: e.target.value,
                          })
                        }
                        className="w-full rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-black outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isQris && (
                <div className="rounded-[28px] border border-orange-100 bg-orange-50/70 p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
                      <QrCode size={24} />
                    </div>

                    <div>
                      <h3 className="font-black text-black">Upload QRIS</h3>
                      <p className="text-sm text-neutral-500">
                        Upload gambar QRIS yang akan digunakan pelanggan.
                      </p>
                    </div>
                  </div>

                  <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-orange-300 bg-white px-5 py-6 text-center font-bold text-neutral-600 transition hover:border-orange-500 hover:text-black">
                    <Upload size={34} className="mb-3 text-orange-500" />
                    Pilih Gambar QRIS
                    <span className="mt-1 text-xs font-medium text-neutral-400">
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50 md:w-fit"
              >
                <Save size={20} />
                {saving
                  ? "Menyimpan..."
                  : editing
                  ? "Update Pembayaran"
                  : "Tambah Pembayaran"}
              </button>
            </div>

            <div className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-5">
              <h3 className="text-lg font-black text-black">Preview</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Tampilan ringkas metode pembayaran yang sedang dibuat.
              </p>

              <div className="mt-5 rounded-[24px] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${
                      isQris ? "bg-orange-500" : "bg-blue-600"
                    }`}
                  >
                    {isQris ? <QrCode size={24} /> : <Landmark size={24} />}
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                      {form.metodePembayaran}
                    </p>
                    <h4 className="font-black text-black">
                      {isQris
                        ? "QRIS Payment"
                        : form.namaBank || "Nama Bank"}
                    </h4>
                  </div>
                </div>

                {isBank && (
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                      <span className="text-neutral-500">Nomor</span>
                      <span className="font-bold text-black">
                        {form.nomorRekening || "-"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3 rounded-2xl bg-neutral-50 px-4 py-3">
                      <span className="text-neutral-500">Pemilik</span>
                      <span className="font-bold text-black">
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
                      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-semibold text-neutral-400">
                        Belum ada QRIS
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5">
                  {form.isActive ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                      <CheckCircle2 size={16} />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
                      <XCircle size={16} />
                      Tidak Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-black">
                Daftar Pembayaran
              </h2>
              <p className="mt-1 text-neutral-500">
                Total: {data.length} metode pembayaran
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3 font-bold text-black transition hover:bg-neutral-200"
            >
              <RefreshCcw size={18} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-neutral-50 p-6 text-neutral-500">
              Loading data pembayaran...
            </div>
          ) : data.length === 0 ? (
            <div className="rounded-3xl bg-neutral-50 p-10 text-center text-neutral-500">
              Belum ada metode pembayaran.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.map((item) => {
                const itemIsQris = item.metodePembayaran === "QRIS";

                return (
                  <div
                    key={item.id}
                    className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white ${
                            itemIsQris ? "bg-orange-500" : "bg-blue-600"
                          }`}
                        >
                          {itemIsQris ? (
                            <QrCode size={24} />
                          ) : (
                            <Landmark size={24} />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                            {item.metodePembayaran}
                          </p>
                          <h3 className="font-black text-black">
                            {itemIsQris
                              ? "QRIS Payment"
                              : item.namaBank || "-"}
                          </h3>
                        </div>
                      </div>

                      {item.isActive === false ? (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                          Off
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                          Aktif
                        </span>
                      )}
                    </div>

                    {itemIsQris ? (
                      <div className="mt-5">
                        {item.qrisImage ? (
                          <img
                            src={`${API_URL}${item.qrisImage}`}
                            alt="QRIS"
                            className="h-48 w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-neutral-400">
                            Tidak ada gambar QRIS
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 space-y-3 text-sm">
                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="text-xs font-bold text-neutral-400">
                            Nomor Rekening
                          </p>
                          <p className="mt-1 font-black text-black">
                            {item.nomorRekening || "-"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white px-4 py-3">
                          <p className="text-xs font-bold text-neutral-400">
                            Nama Pemilik
                          </p>
                          <p className="mt-1 font-black text-black">
                            {item.namaPemilik || "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
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
  className,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}
      >
        {icon}
      </div>
      <p className="mt-4 text-sm font-semibold text-neutral-500">{title}</p>
      <h2 className="mt-1 text-3xl font-black text-black">{value}</h2>
    </div>
  );
}
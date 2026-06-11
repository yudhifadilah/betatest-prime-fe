"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  Eye,
  XCircle,
  ShoppingCart,
  Upload,
  CheckCircle2,
  Save,
  CircleDollarSign,
  Clock3,
  AlertCircle,
  ShieldCheck,
  BadgeDollarSign,
} from "lucide-react";

type GiftingRate = {
  id: number;
  rate: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type GiftingOrder = {
  id: number;
  orderId: string;
  giftingProdukId?: number | string;
  usernamePenerima: string;
  privateServerLink?: string | null;
  namaMap: string;
  namaItem?: string;
  jumlahRobux?: number | string;
  rate?: number | string;
  totalPrice?: number | string;
  nomorRekening?: string;
  paymentProof?: string | null;
  completionProof?: string | null;
  completedAt?: string | null;
  status: string;
  createdAt?: string;
  GiftingProduk?: GiftingRate;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://betatest-prime.vercel.app"
).replace(/\/+$/, "");

export default function DashboardGiftingPage() {
  const [rates, setRates] = useState<GiftingRate[]>([]);
  const [orders, setOrders] = useState<GiftingOrder[]>([]);

  const [loadingRates, setLoadingRates] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchRate, setSearchRate] = useState("");
  const [searchOrder, setSearchOrder] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [selectedCompleteOrder, setSelectedCompleteOrder] =
    useState<GiftingOrder | null>(null);

  const [completionProof, setCompletionProof] = useState<File | null>(null);
  const [completionPreview, setCompletionPreview] = useState<string | null>(
    null
  );
  const [uploadingComplete, setUploadingComplete] = useState(false);

  const [form, setForm] = useState({
    rate: "",
    isActive: true,
  });

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const authHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${getToken()}`,
  };

  const formatRupiah = (value: number | string | undefined | null) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const normalizePaymentUrl = (path?: string | null) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_URL}/${cleanPath}`;
  };

  const safeJson = async (response: Response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Response server bukan JSON");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      rate: "",
      isActive: true,
    });
  };

  const getRates = async () => {
    try {
      setLoadingRates(true);

      const response = await fetch(`${API_URL}/api/gifting/produk`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil rate gifting");
      }

      setRates(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil rate");
    } finally {
      setLoadingRates(false);
    }
  };

  const getOrders = async () => {
    try {
      setLoadingOrders(true);

      const response = await fetch(`${API_URL}/api/gifting/orders`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil order gifting");
      }

      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil order");
    } finally {
      setLoadingOrders(false);
    }
  };

  const submitRate = async () => {
    if (!form.rate || Number(form.rate) <= 0) {
      alert("Rate wajib lebih dari 0");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/api/gifting/produk/${editingId}`
        : `${API_URL}/api/gifting/produk`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify({
          rate: Number(form.rate),
          isActive: form.isActive,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan rate gifting");
      }

      resetForm();
      await getRates();
      alert(editingId ? "Rate berhasil diupdate" : "Rate berhasil dibuat");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan rate");
    } finally {
      setSaving(false);
    }
  };

  const editRate = (item: GiftingRate) => {
    setEditingId(item.id);
    setForm({
      rate: String(item.rate),
      isActive: item.isActive,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRate = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus rate gifting ini?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/gifting/produk/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus rate");
      }

      await getRates();
      alert("Rate berhasil dihapus");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus rate");
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    const order = orders.find((item) => item.id === id);

    if (status === "completed" && order) {
      setSelectedCompleteOrder(order);
      setCompletionProof(null);
      setCompletionPreview(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/gifting/orders/${id}/status`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ status }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal update status order");
      }

      await getOrders();
      alert("Status order berhasil diupdate");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal update status");
    }
  };

  const handleCompletionProofChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("File harus berupa PNG, JPG, JPEG, atau WEBP");
      return;
    }

    setCompletionProof(file);
    setCompletionPreview(URL.createObjectURL(file));
  };

  const submitCompletedStatus = async () => {
    if (!selectedCompleteOrder) return;

    if (!completionProof) {
      alert("Upload bukti screenshot terlebih dahulu");
      return;
    }

    try {
      setUploadingComplete(true);

      const formData = new FormData();
      formData.append("status", "completed");
      formData.append("completionProof", completionProof);

      const response = await fetch(
        `${API_URL}/api/gifting/orders/${selectedCompleteOrder.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
          body: formData,
        }
      );

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyelesaikan order");
      }

      setSelectedCompleteOrder(null);
      setCompletionProof(null);
      setCompletionPreview(null);
      await getOrders();
      alert("Order berhasil diselesaikan");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal menyelesaikan order"
      );
    } finally {
      setUploadingComplete(false);
    }
  };

  useEffect(() => {
    getRates();
    getOrders();
  }, []);

  const filteredRates = useMemo(() => {
    const keyword = searchRate.toLowerCase();

    return rates.filter((item) => {
      return (
        String(item.id || "").toLowerCase().includes(keyword) ||
        String(item.rate || "").toLowerCase().includes(keyword) ||
        String(item.isActive ? "aktif" : "nonaktif")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [rates, searchRate]);

  const filteredOrders = useMemo(() => {
    const keyword = searchOrder.toLowerCase();

    return orders.filter((item) => {
      return (
        String(item.orderId || "").toLowerCase().includes(keyword) ||
        String(item.usernamePenerima || "").toLowerCase().includes(keyword) ||
        String(item.namaMap || "").toLowerCase().includes(keyword) ||
        String(item.namaItem || "").toLowerCase().includes(keyword) ||
        String(item.nomorRekening || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [orders, searchOrder]);

  const activeRate = rates.find((item) => item.isActive !== false);

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + Number(order.totalPrice || 0);
  }, 0);

  const totalCompleted = orders.filter(
    (item) => item.status === "completed" || item.status === "success"
  ).length;

  const totalPending = orders.filter(
    (item) => item.status === "pending" || !item.status
  ).length;

  const getStatusBadge = (status?: string) => {
    const current = String(status || "pending").toLowerCase();

    const style =
      current === "completed" || current === "success"
        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
        : current === "processing"
        ? "bg-blue-100 text-blue-700 border-blue-200"
        : current === "cancelled"
        ? "bg-red-100 text-red-700 border-red-200"
        : current === "unpaid"
        ? "bg-neutral-100 text-neutral-700 border-neutral-200"
        : "bg-yellow-100 text-yellow-700 border-yellow-200";

    const label =
      current === "completed" || current === "success"
        ? "Completed"
        : current === "processing"
        ? "Processing"
        : current === "cancelled"
        ? "Cancelled"
        : current === "unpaid"
        ? "Unpaid"
        : "Pending";

    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${style}`}
      >
        {label}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-neutral-100 px-5 pb-10 pt-24 md:px-8 md:pt-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[34px] border border-neutral-200 bg-white shadow-sm">
          <div className="relative p-6 md:p-8">
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-black/5 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                  <ShieldCheck size={18} />
                  Gifting Management
                </div>

                <h1 className="mt-5 text-4xl font-black text-black md:text-5xl">
                  Dashboard Gifting
                </h1>

                <p className="mt-3 max-w-2xl text-neutral-500">
                  Kelola rate gifting, pantau order pelanggan, dan upload bukti
                  penyelesaian order dalam satu halaman modern.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  getRates();
                  getOrders();
                }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-bold text-white shadow-lg transition hover:opacity-90"
              >
                <RefreshCw size={20} />
                Refresh Data
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Rate Aktif"
            value={activeRate ? formatRupiah(activeRate.rate) : "-"}
            subtitle="Rate gifting saat ini"
            icon={<BadgeDollarSign size={24} />}
          />
          <StatCard
            title="Total Rate"
            value={rates.length}
            subtitle="Data rate tersimpan"
            icon={<CircleDollarSign size={24} />}
          />
          <StatCard
            title="Total Order"
            value={orders.length}
            subtitle="Order gifting masuk"
            icon={<ShoppingCart size={24} />}
          />
          <StatCard
            title="Revenue"
            value={formatRupiah(totalRevenue)}
            subtitle={`${totalPending} order pending`}
            icon={<CircleDollarSign size={24} />}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <BadgeDollarSign size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-black">
                  {editingId ? "Edit Rate" : "Tambah Rate"}
                </h2>
                <p className="text-sm text-neutral-500">
                  Rate akan dipakai untuk menghitung harga order gifting.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InputField
                label="Rate"
                type="number"
                placeholder="80"
                value={form.rate}
                onChange={(value) =>
                  setForm({
                    ...form,
                    rate: value,
                  })
                }
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Status Rate
                </label>

                <select
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive: e.target.value === "true",
                    })
                  }
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <button
                type="button"
                onClick={submitRate}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {editingId ? <Save size={20} /> : <Plus size={20} />}
                {saving
                  ? "Menyimpan..."
                  : editingId
                  ? "Update Rate"
                  : "Tambah Rate"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl bg-neutral-100 px-6 py-4 font-bold text-black transition hover:bg-neutral-200"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black text-black">
                  Daftar Rate
                </h2>
                <p className="text-sm text-neutral-500">
                  Total {filteredRates.length} rate ditemukan.
                </p>
              </div>

              <SearchBox
                value={searchRate}
                onChange={setSearchRate}
                placeholder="Cari rate..."
              />
            </div>

            {loadingRates ? (
              <EmptyState text="Loading rate..." />
            ) : filteredRates.length === 0 ? (
              <EmptyState text="Rate gifting belum tersedia." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRates.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[26px] border border-neutral-200 bg-neutral-50 p-5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-black">
                          Rate #{item.id}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          Dibuat:{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("id-ID")
                            : "-"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>

                    <div className="mt-5 rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-bold text-neutral-400">
                        Rate
                      </p>
                      <p className="mt-1 text-xl font-black text-black">
                        {formatRupiah(item.rate)} / Robux
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => editRate(item)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteRate(item.id)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-black text-black">
                <ShoppingCart size={26} />
                Order Gifting
              </h2>
              <p className="mt-1 text-neutral-500">
                Kelola status order dan lihat bukti pembayaran pelanggan.
              </p>
            </div>

            <SearchBox
              value={searchOrder}
              onChange={setSearchOrder}
              placeholder="Cari order..."
            />
          </div>

          {loadingOrders ? (
            <EmptyState text="Loading order..." />
          ) : filteredOrders.length === 0 ? (
            <EmptyState text="Order gifting belum tersedia." />
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-5 transition hover:shadow-lg"
                >
                  <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                    <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InfoBlock
                        label="Order ID"
                        value={order.orderId || "-"}
                        bold
                      />
                      <InfoBlock
                        label="Username Penerima"
                        value={order.usernamePenerima || "-"}
                      />
                      <InfoBlock label="Nama Map" value={order.namaMap || "-"} />
                      <InfoBlock
                        label="Total Harga"
                        value={formatRupiah(order.totalPrice)}
                        bold
                      />
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoBlock label="Nama Item" value={order.namaItem || "-"} />
                    <InfoBlock
                      label="Jumlah Robux"
                      value={`${Number(order.jumlahRobux || 0).toLocaleString(
                        "id-ID"
                      )} Robux`}
                    />
                    <InfoBlock
                      label="Rate"
                      value={`${formatRupiah(order.rate)} / Robux`}
                    />
                    <InfoBlock
                      label="Rekening"
                      value={order.nomorRekening || "-"}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <InfoBlock
                      label="Private Server"
                      value={order.privateServerLink || "-"}
                    />

                    <ProofButton
                      label="Bukti Bayar"
                      available={Boolean(order.paymentProof)}
                      onClick={() =>
                        setPreviewImage(normalizePaymentUrl(order.paymentProof))
                      }
                    />

                    <ProofButton
                      label="Bukti Selesai"
                      available={Boolean(order.completionProof)}
                      success
                      onClick={() =>
                        setPreviewImage(
                          normalizePaymentUrl(order.completionProof)
                        )
                      }
                    />

                    <div className="rounded-2xl bg-white px-4 py-3">
                      <p className="text-xs font-bold text-neutral-400">
                        Tanggal Order
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-700">
                        <Clock3 size={16} />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("id-ID")
                          : "Tanggal tidak tersedia"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-neutral-500">
                      Status dapat diubah oleh admin atau staff.
                    </div>

                    <select
                      value={order.status || "pending"}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-bold text-black outline-none focus:border-black"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-[32px] bg-white p-4">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -right-3 -top-3 rounded-full bg-white p-2 shadow-lg"
            >
              <XCircle />
            </button>

            <img
              src={previewImage}
              alt="preview proof"
              className="max-h-[80vh] w-full rounded-[24px] object-contain"
            />
          </div>
        </div>
      )}

      {selectedCompleteOrder && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-black">
                  Upload Bukti Completed
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Order ID:{" "}
                  <span className="font-bold text-black">
                    {selectedCompleteOrder.orderId}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCompleteOrder(null);
                  setCompletionProof(null);
                  setCompletionPreview(null);
                }}
                className="rounded-full bg-neutral-100 p-2"
              >
                <XCircle />
              </button>
            </div>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[26px] border-2 border-dashed border-neutral-300 bg-neutral-50 p-8 text-center transition hover:border-black">
              <Upload size={38} className="text-neutral-500" />

              <p className="mt-3 font-bold text-black">
                Upload screenshot bukti selesai
              </p>

              <p className="mt-1 text-sm text-neutral-500">
                PNG, JPG, JPEG, atau WEBP
              </p>

              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleCompletionProofChange}
                className="hidden"
              />
            </label>

            {completionPreview && (
              <div className="mt-5 overflow-hidden rounded-3xl border border-neutral-200">
                <img
                  src={completionPreview}
                  alt="Preview bukti completed"
                  className="max-h-80 w-full bg-neutral-100 object-contain"
                />
              </div>
            )}

            {completionProof && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                <CheckCircle2 size={20} />
                <span className="font-bold">{completionProof.name}</span>
              </div>
            )}

            <button
              type="button"
              onClick={submitCompletedStatus}
              disabled={uploadingComplete}
              className="mt-5 w-full rounded-2xl bg-black px-5 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {uploadingComplete ? "Mengupload..." : "Selesaikan Order"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-black transition group-hover:bg-black group-hover:text-white">
        {icon}
      </div>

      <p className="mt-5 text-sm font-bold text-neutral-500">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-black">{value}</h2>
      <p className="mt-2 text-sm text-neutral-400">{subtitle}</p>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 md:w-[320px]">
      <Search size={18} className="text-neutral-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-black outline-none placeholder:text-neutral-400"
      />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-black">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
      />
    </div>
  );
}

function InfoBlock({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-bold text-neutral-400">{label}</p>
      <p
        className={`mt-1 truncate text-sm ${
          bold ? "font-black text-black" : "font-semibold text-neutral-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProofButton({
  label,
  available,
  onClick,
  success = false,
}: {
  label: string;
  available: boolean;
  onClick: () => void;
  success?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-bold text-neutral-400">{label}</p>

      {available ? (
        <button
          type="button"
          onClick={onClick}
          className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ${
            success
              ? "bg-emerald-100 text-emerald-700"
              : "bg-neutral-100 text-black"
          }`}
        >
          <Eye size={16} />
          Lihat
        </button>
      ) : (
        <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-400">
          <AlertCircle size={16} />
          Tidak ada
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[30px] border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-white shadow-sm">
        <AlertCircle size={30} className="text-neutral-400" />
      </div>

      <h3 className="mt-5 text-lg font-black text-black">Tidak Ada Data</h3>

      <p className="mt-2 max-w-sm text-sm text-neutral-500">{text}</p>
    </div>
  );
}

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
  Package,
  ShoppingCart,
  Save,
  CircleDollarSign,
  Clock3,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Gem,
} from "lucide-react";

type PayoutProduk = {
  id: number;
  namaProduk: string;
  nominalRobux: number;
  harga: number;
  isActive: boolean;
  createdAt?: string;
};

type PayoutOrder = {
  id: number;
  orderId: string;
  payoutProdukId?: number | string;
  robloxUsername: string;
  robloxUserId?: string;
  nomorRekening: string;
  paymentProof?: string | null;
  isJoinedGroup?: boolean;
  status: string;
  createdAt?: string;
  PayoutProduk?: PayoutProduk;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://betatest-prime.vercel.app"
).replace(/\/+$/, "");

export default function DashboardPayoutPage() {
  const [products, setProducts] = useState<PayoutProduk[]>([]);
  const [orders, setOrders] = useState<PayoutOrder[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchProduct, setSearchProduct] = useState("");
  const [searchOrder, setSearchOrder] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [form, setForm] = useState({
    namaProduk: "",
    nominalRobux: "",
    harga: "",
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

  const formatRupiah = (value: number | string) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const formatRobux = (value: number | string) => {
    return `${Number(value || 0).toLocaleString("id-ID")} Robux`;
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
      console.error("Response bukan JSON:", text);
      throw new Error("Response server bukan JSON");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      namaProduk: "",
      nominalRobux: "",
      harga: "",
      isActive: true,
    });
  };

  const getProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await fetch(`${API_URL}/api/payout/produk`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil produk payout");
      }

      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil produk");
    } finally {
      setLoadingProducts(false);
    }
  };

  const getOrders = async () => {
    try {
      setLoadingOrders(true);

      const response = await fetch(`${API_URL}/api/payout/orders`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil order payout");
      }

      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil order");
    } finally {
      setLoadingOrders(false);
    }
  };

  const submitProduct = async () => {
    if (!form.namaProduk || !form.nominalRobux || !form.harga) {
      alert("Nama produk, nominal robux, dan harga wajib diisi");
      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/api/payout/produk/${editingId}`
        : `${API_URL}/api/payout/produk`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders,
        body: JSON.stringify({
          namaProduk: form.namaProduk,
          nominalRobux: Number(form.nominalRobux),
          harga: Number(form.harga),
          isActive: form.isActive,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan produk payout");
      }

      resetForm();
      await getProducts();
      alert(editingId ? "Produk berhasil diupdate" : "Produk berhasil dibuat");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (item: PayoutProduk) => {
    setEditingId(item.id);
    setForm({
      namaProduk: item.namaProduk,
      nominalRobux: String(item.nominalRobux),
      harga: String(item.harga),
      isActive: item.isActive,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteProduct = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus produk payout ini?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/payout/produk/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal menghapus produk");
      }

      await getProducts();
      alert("Produk berhasil dihapus");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus produk");
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/payout/orders/${id}/status`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({ status }),
        }
      );

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

  useEffect(() => {
    getProducts();
    getOrders();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = searchProduct.toLowerCase();

    return products.filter((item) => {
      return (
        String(item.namaProduk || "").toLowerCase().includes(keyword) ||
        String(item.nominalRobux || "").toLowerCase().includes(keyword) ||
        String(item.harga || "").toLowerCase().includes(keyword)
      );
    });
  }, [products, searchProduct]);

  const filteredOrders = useMemo(() => {
    const keyword = searchOrder.toLowerCase();

    return orders.filter((item) => {
      const produk = products.find(
        (p) => String(p.id) === String(item.payoutProdukId)
      );

      return (
        String(item.orderId || "").toLowerCase().includes(keyword) ||
        String(item.robloxUsername || "").toLowerCase().includes(keyword) ||
        String(item.nomorRekening || "").toLowerCase().includes(keyword) ||
        String(item.status || "").toLowerCase().includes(keyword) ||
        String(item.PayoutProduk?.namaProduk || produk?.namaProduk || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [orders, searchOrder, products]);

  const getOrderProduct = (order: PayoutOrder) => {
    const produkFromList = products.find(
      (item) => String(item.id) === String(order.payoutProdukId)
    );

    return {
      namaProduk:
        order.PayoutProduk?.namaProduk ||
        produkFromList?.namaProduk ||
        "Payout",
      harga: Number(order.PayoutProduk?.harga || produkFromList?.harga || 0),
      nominalRobux: Number(
        order.PayoutProduk?.nominalRobux || produkFromList?.nominalRobux || 0
      ),
    };
  };

  const totalRevenue = orders.reduce((sum, order) => {
    const produk = getOrderProduct(order);
    return sum + Number(produk.harga || 0);
  }, 0);

  const totalRobux = orders.reduce((sum, order) => {
    const produk = getOrderProduct(order);
    return sum + Number(produk.nominalRobux || 0);
  }, 0);

  const totalCompleted = orders.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status === "completed" || status === "success";
  }).length;

  const totalPending = orders.filter((item) => {
    const status = String(item.status || "pending").toLowerCase();
    return status === "pending" || status === "unpaid";
  }).length;

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
                  Payout Management
                </div>

                <h1 className="mt-5 text-4xl font-black text-black md:text-5xl">
                  Dashboard Payout
                </h1>

                <p className="mt-3 max-w-2xl text-neutral-500">
                  Kelola produk payout, pantau order Roblox, cek bukti
                  pembayaran, dan update status transaksi dengan tampilan yang
                  lebih modern.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  getProducts();
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
            title="Total Produk"
            value={products.length}
            subtitle="Produk payout tersedia"
            icon={<Package size={24} />}
          />
          <StatCard
            title="Total Order"
            value={orders.length}
            subtitle="Order payout masuk"
            icon={<ShoppingCart size={24} />}
          />
          <StatCard
            title="Total Robux"
            value={formatRobux(totalRobux)}
            subtitle={`${totalPending} order pending`}
            icon={<Gem size={24} />}
          />
          <StatCard
            title="Revenue"
            value={formatRupiah(totalRevenue)}
            subtitle={`${totalCompleted} order completed`}
            icon={<CircleDollarSign size={24} />}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <Package size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-black">
                  {editingId ? "Edit Produk" : "Tambah Produk"}
                </h2>
                <p className="text-sm text-neutral-500">
                  Atur nama produk, nominal robux, harga, dan status produk.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InputField
                label="Nama Produk"
                placeholder="Payout 100 Robux"
                value={form.namaProduk}
                onChange={(value) =>
                  setForm({
                    ...form,
                    namaProduk: value,
                  })
                }
              />

              <InputField
                label="Nominal Robux"
                type="number"
                placeholder="100"
                value={form.nominalRobux}
                onChange={(value) =>
                  setForm({
                    ...form,
                    nominalRobux: value,
                  })
                }
              />

              <InputField
                label="Harga"
                type="number"
                placeholder="15000"
                value={form.harga}
                onChange={(value) =>
                  setForm({
                    ...form,
                    harga: value,
                  })
                }
              />

              <div>
                <label className="mb-2 block text-sm font-bold text-black">
                  Status Produk
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
                onClick={submitProduct}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {editingId ? <Save size={20} /> : <Plus size={20} />}
                {saving
                  ? "Menyimpan..."
                  : editingId
                  ? "Update Produk"
                  : "Tambah Produk"}
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
                  Daftar Produk
                </h2>
                <p className="text-sm text-neutral-500">
                  Total {filteredProducts.length} produk ditemukan.
                </p>
              </div>

              <SearchBox
                value={searchProduct}
                onChange={setSearchProduct}
                placeholder="Cari produk..."
              />
            </div>

            {loadingProducts ? (
              <EmptyState text="Loading produk..." />
            ) : filteredProducts.length === 0 ? (
              <EmptyState text="Produk belum tersedia." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[26px] border border-neutral-200 bg-neutral-50 p-5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-black">
                          {item.namaProduk}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          {formatRobux(item.nominalRobux)}
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
                        Harga
                      </p>
                      <p className="mt-1 text-xl font-black text-black">
                        {formatRupiah(item.harga)}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button
                        type="button"
                        onClick={() => editProduct(item)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteProduct(item.id)}
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
                Order Payout
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
            <EmptyState text="Order payout belum tersedia." />
          ) : (
            <div className="grid gap-4">
              {filteredOrders.map((order) => {
                const produk = getOrderProduct(order);

                return (
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
                          label="Username"
                          value={order.robloxUsername || "-"}
                        />
                        <InfoBlock label="Produk" value={produk.namaProduk} />
                        <InfoBlock
                          label="Robux"
                          value={formatRobux(produk.nominalRobux)}
                          bold
                        />
                      </div>

                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <InfoBlock
                        label="Harga"
                        value={formatRupiah(produk.harga)}
                        bold
                      />

                      <InfoBlock
                        label="Rekening"
                        value={order.nomorRekening || "-"}
                      />

                      <InfoBlock
                        label="Join Group"
                        value={order.isJoinedGroup ? "Sudah Join" : "Belum Join"}
                      />

                      <ProofButton
                        label="Bukti Bayar"
                        available={Boolean(order.paymentProof)}
                        onClick={() =>
                          setPreviewImage(
                            normalizePaymentUrl(order.paymentProof)
                          )
                        }
                      />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Clock3 size={16} />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("id-ID")
                          : "Tanggal tidak tersedia"}
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
                );
              })}
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
              alt="payment proof"
              className="max-h-[80vh] w-full rounded-[24px] object-contain"
            />
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
}: {
  label: string;
  available: boolean;
  onClick: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-xs font-bold text-neutral-400">{label}</p>

      {available ? (
        <button
          type="button"
          onClick={onClick}
          className="mt-2 flex items-center gap-2 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-bold text-black transition hover:bg-neutral-200"
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

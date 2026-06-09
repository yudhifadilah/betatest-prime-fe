"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gem,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Search,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  ReceiptText,
  PackageCheck,
  Clock3,
} from "lucide-react";

type Category = "limited" | "tumbal";

type LimsItem = {
  id: number;
  namaItem: string;
  assetId: string;
  harga: number;
  isActive?: boolean;
  isTumbalAvailable?: boolean;
};

type LimsOrder = {
  id: number;
  orderId?: string;
  robloxUsername?: string;
  buyerName?: string;
  productName?: string;
  namaItem?: string;
  assetId?: string;
  price?: number;
  harga?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const getOrderStatusStyle = (
  status?: string,
  paymentStatus?: string
) => {
  const currentStatus = (
    paymentStatus === "unpaid"
      ? "unpaid"
      : status || "pending"
  ).toLowerCase();

  switch (currentStatus) {
    case "unpaid":
      return {
        className:
          "bg-orange-50 text-orange-700 border border-orange-200",
        label: "Belum Bayar",
      };

    case "pending":
      return {
        className:
          "bg-yellow-50 text-yellow-700 border border-yellow-200",
        label: "Pending",
      };

    case "accepted":
      return {
        className:
          "bg-indigo-50 text-indigo-700 border border-indigo-200",
        label: "Diterima",
      };

    case "processing":
      return {
        className:
          "bg-blue-50 text-blue-700 border border-blue-200",
        label: "Diproses",
      };

    case "completed":
    case "selesai":
      return {
        className:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
        label: "Selesai",
      };

    case "cancelled":
    case "canceled":
      return {
        className:
          "bg-red-50 text-red-700 border border-red-200",
        label: "Dibatalkan",
      };

    default:
      return {
        className:
          "bg-neutral-100 text-neutral-700 border border-neutral-200",
        label: status || "Unknown",
      };
  }
};

export default function DashboardLimitedItemsPage() {
  const [category, setCategory] = useState<Category>("limited");
  const [items, setItems] = useState<LimsItem[]>([]);
  const [orders, setOrders] = useState<LimsOrder[]>([]);
  const [search, setSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    namaItem: "",
    assetId: "",
    harga: "",
    isActive: true,
  });

  const endpoint = category === "limited" ? "/api/lims/produk" : "/api/tumbal";

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.namaItem.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = orderSearch.toLowerCase();

      return (
        order.orderId?.toLowerCase().includes(keyword) ||
        order.robloxUsername?.toLowerCase().includes(keyword) ||
        order.buyerName?.toLowerCase().includes(keyword) ||
        order.productName?.toLowerCase().includes(keyword) ||
        order.namaItem?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, orderSearch]);

  const activeItems = items.filter((item) => item.isActive !== false).length;
  const inactiveItems = items.filter((item) => item.isActive === false).length;
  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.paymentStatus === "unpaid" ||
      !order.status
  ).length;

  const resetForm = () => {
    setEditingId(null);
    setForm({
      namaItem: "",
      assetId: "",
      harga: "",
      isActive: true,
    });
  };

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const loadItems = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil data");
      }

      setItems(json.data || []);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);

      const res = await fetch(`${API_URL}/api/lims/orders`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil order LIMS");
      }

      setOrders(json.data || []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.namaItem || !form.assetId || !form.harga) {
      alert("Nama item, asset ID, dan harga wajib diisi");
      return;
    }

    try {
      setSaving(true);

      const payload =
        category === "limited"
          ? {
              namaItem: form.namaItem,
              assetId: form.assetId,
              harga: Number(form.harga),
              isActive: form.isActive,
              isTumbalAvailable: false,
            }
          : {
              namaItem: form.namaItem,
              assetId: form.assetId,
              harga: Number(form.harga),
              isActive: form.isActive,
            };

      const url = editingId
        ? `${API_URL}${endpoint}/${editingId}`
        : `${API_URL}${endpoint}`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan data");
      }

      resetForm();
      await loadItems();
      alert(editingId ? "Item berhasil diupdate" : "Item berhasil ditambahkan");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: LimsItem) => {
    setEditingId(item.id);
    setForm({
      namaItem: item.namaItem,
      assetId: item.assetId,
      harga: String(item.harga),
      isActive: item.isActive !== false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus item ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus item");
      }

      await loadItems();
      alert("Item berhasil dihapus");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus item");
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/lims/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Gagal update status order");
      }

      await loadOrders();
      alert("Status order berhasil diupdate");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal update status order"
      );
    }
  };

  useEffect(() => {
    resetForm();
    loadItems();
  }, [category]);

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-100 px-5 pb-10 pt-24 md:px-8 md:pt-8">
      <div className="w-full space-y-8">
        <section className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-bold text-white">
                <Gem size={18} />
                LIMS Dashboard
              </div>

              <h1 className="mt-5 text-4xl font-black text-black md:text-5xl">
                Item Limited
              </h1>

              <p className="mt-2 max-w-2xl text-neutral-500">
                Kelola item limited, item tumbal, dan order item LIMS dalam satu
                halaman dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadItems();
                loadOrders();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-bold text-white transition hover:opacity-90"
            >
              <RefreshCcw size={18} />
              Refresh Data
            </button>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-4">
          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
              <PackageCheck size={24} />
            </div>
            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Total Item
            </p>
            <h2 className="mt-1 text-3xl font-black text-black">
              {items.length}
            </h2>
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <CheckCircle2 size={24} />
            </div>
            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Item Aktif
            </p>
            <h2 className="mt-1 text-3xl font-black text-black">
              {activeItems}
            </h2>
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500 text-white">
              <XCircle size={24} />
            </div>
            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Tidak Aktif
            </p>
            <h2 className="mt-1 text-3xl font-black text-black">
              {inactiveItems}
            </h2>
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <Clock3 size={24} />
            </div>
            <p className="mt-4 text-sm font-semibold text-neutral-500">
              Order Pending
            </p>
            <h2 className="mt-1 text-3xl font-black text-black">
              {pendingOrders}
            </h2>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setCategory("limited")}
            className={`rounded-[30px] border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
              category === "limited"
                ? "border-black bg-black text-white"
                : "border-neutral-200 bg-white text-black"
            }`}
          >
            <Gem size={36} />
            <h2 className="mt-4 text-2xl font-black">Item Limited</h2>
            <p
              className={`mt-1 ${
                category === "limited" ? "text-neutral-300" : "text-neutral-500"
              }`}
            >
              Tambah, edit, dan hapus produk limited.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCategory("tumbal")}
            className={`rounded-[30px] border p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
              category === "tumbal"
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-neutral-200 bg-white text-black"
            }`}
          >
            <Gem size={36} />
            <h2 className="mt-4 text-2xl font-black">Item Tumbal</h2>
            <p
              className={`mt-1 ${
                category === "tumbal" ? "text-emerald-50" : "text-neutral-500"
              }`}
            >
              Tambah, edit, dan hapus produk tumbal.
            </p>
          </button>
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-black">
                {editingId ? "Edit Item" : "Tambah Item"}{" "}
                {category === "limited" ? "Limited" : "Tumbal"}
              </h2>
              <p className="mt-1 text-neutral-500">
                Isi data item dengan benar sebelum disimpan.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl bg-neutral-100 px-4 py-3 font-bold text-black transition hover:bg-neutral-200"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              type="text"
              placeholder="Nama item"
              value={form.namaItem}
              onChange={(e) => setForm({ ...form, namaItem: e.target.value })}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
            />

            <input
              type="text"
              placeholder="Asset ID"
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
            />

            <input
              type="number"
              placeholder="Harga"
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
            />

            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.value === "active" })
              }
              className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-black outline-none focus:border-black"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-black px-6 py-4 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={20} />
            {saving
              ? "Menyimpan..."
              : editingId
              ? "Update Item"
              : "Tambah Item"}
          </button>
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-black text-black">
                Daftar Item {category === "limited" ? "Limited" : "Tumbal"}
              </h2>
              <p className="mt-1 text-neutral-500">
                Total: {filteredItems.length} item
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-3">
                <Search size={18} className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-black outline-none"
                />
              </div>

              <button
                type="button"
                onClick={loadItems}
                className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3 font-bold text-black transition hover:bg-neutral-200"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-neutral-50 p-6 text-neutral-500">
              Loading data...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl bg-neutral-50 p-10 text-center text-neutral-500">
              Item belum tersedia.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-neutral-200">
              <table className="w-full min-w-[900px] border-collapse bg-white text-left">
                <thead className="bg-neutral-100 text-sm text-neutral-600">
                  <tr>
                    <th className="px-5 py-4">Item</th>
                    <th className="px-5 py-4">Asset ID</th>
                    <th className="px-5 py-4">Harga</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-neutral-200 text-sm"
                    >
                      <td className="px-5 py-4">
                        <div className="font-bold text-black">
                          {item.namaItem}
                        </div>
                        <div className="text-xs text-neutral-500">
                          ID: {item.id}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-neutral-600">
                        {item.assetId}
                      </td>

                      <td className="px-5 py-4 font-bold text-black">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </td>

                      <td className="px-5 py-4">
                        {item.isActive === false ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 font-semibold text-red-600">
                            <XCircle size={16} />
                            Tidak Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
                            <CheckCircle2 size={16} />
                            Aktif
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-2 font-semibold text-black transition hover:bg-neutral-200"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-black">
                <ShoppingCart size={26} />
                Order Item LIMS
              </h2>
              <p className="mt-1 text-neutral-500">
                Daftar order item limited dan item tumbal dari user.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-3">
                <Search size={18} className="text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari order..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="bg-transparent text-black outline-none"
                />
              </div>

              <button
                type="button"
                onClick={loadOrders}
                className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-100 px-5 py-3 font-bold text-black transition hover:bg-neutral-200"
              >
                <RefreshCcw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {loadingOrders ? (
            <div className="rounded-3xl bg-neutral-50 p-6 text-neutral-500">
              Loading order LIMS...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-3xl bg-neutral-50 p-10 text-center text-neutral-500">
              Belum ada order item LIMS.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-neutral-200">
              <table className="w-full min-w-[1000px] border-collapse bg-white text-left">
                <thead className="bg-neutral-100 text-sm text-neutral-600">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Buyer</th>
                    <th className="px-5 py-4">Item</th>
                    <th className="px-5 py-4">Asset ID</th>
                    <th className="px-5 py-4">Harga</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const itemName = order.productName || order.namaItem || "-";
                    const price = order.price || order.harga || 0;
                    const statusConfig = getOrderStatusStyle(
                      order.status,
                      order.paymentStatus
                    );

                    return (
                      <tr
                        key={order.id}
                        className="border-t border-neutral-200 text-sm"
                      >
                        <td className="px-5 py-4">
                          <div className="font-bold text-black">
                            {order.orderId || `#${order.id}`}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString(
                                  "id-ID"
                                )
                              : "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-black">
                            {order.robloxUsername || order.buyerName || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {itemName}
                        </td>

                        <td className="px-5 py-4 text-neutral-600">
                          {order.assetId || "-"}
                        </td>

                        <td className="px-5 py-4 font-bold text-black">
                          Rp {Number(price).toLocaleString("id-ID")}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-semibold capitalize ${statusConfig.className}`}
                          >
                            <ReceiptText size={16} />
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, "processing")
                              }
                              className="rounded-xl bg-blue-100 px-4 py-2 font-semibold text-cyan-700 transition hover:bg-cyan-100"
                            >
                              Proses
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, "completed")
                              }
                              className="rounded-xl bg-emerald-100 px-4 py-2 font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              Selesai
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                              className="rounded-xl bg-red-100 px-4 py-2 font-semibold text-rose-700 transition hover:bg-rose-100"
                            >
                              Batal
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  ShieldCheck,
  Clock3,
  Lock,
  Phone,
  Upload,
  CheckCircle2,
  CreditCard,
  CircleDollarSign,
  QrCode,
  Landmark,
  AlertCircle,
} from "lucide-react";

type VilogPackage = {
  id: number;
  namaProduk: string;
  deskripsi?: string;
  harga: number;
  isActive?: boolean;
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

type OrderResponse = {
  message?: string;
  error?: string;
  data?: {
    id?: number;
    orderId?: string;
    status?: string;
    paymentProof?: string;
  };
};

const API_URL = 
  process.env.NEXT_PUBLIC_API_URL;

export default function VilogPage() {
  const [vilogPackages, setVilogPackages] = useState<VilogPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Rekening[]>([]);

  const [selectedPackage, setSelectedPackage] =
    useState<VilogPackage | null>(null);

  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    backupCode1: "",
    backupCode2: "",
    backupCode3: "",
    contact: "",
    nomorRekening: "",
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);

  const [createdOrder, setCreatedOrder] = useState<{
    id?: number;
    orderId?: string;
    status?: string;
  } | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const selectedPayment = useMemo(() => {
    return paymentMethods.find(
      (item) => String(item.id) === String(selectedPaymentId)
    );
  }, [paymentMethods, selectedPaymentId]);

  const bankMethods = paymentMethods.filter(
    (item) => item.metodePembayaran === "BANK"
  );

  const qrisMethods = paymentMethods.filter(
    (item) => item.metodePembayaran === "QRIS"
  );

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

  const safeJson = async (response: Response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Response server bukan JSON");
    }
  };

  const getAllVilogProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await fetch(`${API_URL}/api/vilog/produk`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil produk vilog");
      }

      setVilogPackages(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("GET VILOG ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal mengambil produk");
    } finally {
      setLoadingProducts(false);
    }
  };

  const getPaymentMethods = async () => {
    try {
      setLoadingPayments(true);

      const response = await fetch(`${API_URL}/api/rekening`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil metode pembayaran");
      }

      const activeMethods = Array.isArray(result.data)
        ? result.data.filter((item: Rekening) => item.isActive !== false)
        : [];

      setPaymentMethods(activeMethods);

      if (!selectedPaymentId && activeMethods.length > 0) {
        setSelectedPaymentId(String(activeMethods[0].id));
      }
    } catch (error) {
      console.error("GET PAYMENT METHODS ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil metode pembayaran"
      );
    } finally {
      setLoadingPayments(false);
    }
  };

  const getDetailVilogProduct = async (id: number) => {
    try {
      setLoadingDetail(true);

      const response = await fetch(`${API_URL}/api/vilog/produk/${id}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil detail produk");
      }

      setSelectedPackage(result.data);
      setCreatedOrder(null);
      setPaymentProof(null);
      setPaymentPreview(null);
    } catch (error) {
      console.error("GET DETAIL VILOG ERROR:", error);
      alert(
        error instanceof Error ? error.message : "Gagal mengambil detail produk"
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    getAllVilogProducts();
    getPaymentMethods();
  }, []);

  const handlePaymentProofChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("File harus berupa PNG, JPG, JPEG, atau WEBP");
      return;
    }

    setPaymentProof(file);
    setPaymentPreview(URL.createObjectURL(file));
  };

  const handleOrder = async () => {
    if (!selectedPackage) {
      alert("Pilih paket vilog terlebih dahulu");
      return;
    }

    if (!selectedPayment) {
      alert("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    if (
      !form.username ||
      !form.password ||
      !form.backupCode1 ||
      !form.backupCode2 ||
      !form.backupCode3 ||
      !form.contact ||
      !form.nomorRekening
    ) {
      alert(
        "Username, password, 3 backup code, kontak, dan nomor rekening/e-wallet pengirim wajib diisi"
      );
      return;
    }

    if (!paymentProof) {
      alert("Upload bukti pembayaran terlebih dahulu");
      return;
    }

    try {
      setLoadingOrder(true);

      const formData = new FormData();

      formData.append("vilogProdukId", String(selectedPackage.id));
      formData.append("robloxUsername", form.username);
      formData.append("robloxPassword", form.password);
      formData.append(
        "backupCode",
        JSON.stringify([
          form.backupCode1,
          form.backupCode2,
          form.backupCode3,
        ])
      );
      formData.append("contact", form.contact);

      // Nomor rekening / e-wallet pengirim dari buyer.
      formData.append("nomorRekening", form.nomorRekening);

      // Data metode pembayaran yang dipilih dari dashboard rekening.
      formData.append("rekeningId", String(selectedPayment.id));
      formData.append("paymentMethodId", String(selectedPayment.id));
      formData.append("metodePembayaran", selectedPayment.metodePembayaran);
      formData.append("namaBankTujuan", selectedPayment.namaBank || "");
      formData.append(
        "nomorRekeningTujuan",
        selectedPayment.nomorRekening || ""
      );
      formData.append("namaPemilikTujuan", selectedPayment.namaPemilik || "");

      if (paymentProof) {
        formData.append("paymentProof", paymentProof);
      }

      const response = await fetch(`${API_URL}/api/vilog/order`, {
        method: "POST",
        body: formData,
      });

      const data: OrderResponse = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Gagal membuat order");
      }

      setCreatedOrder({
        id: data.data?.id,
        orderId: data.data?.orderId,
        status: data.data?.status,
      });

      alert("Order Vilog berhasil dibuat");
    } catch (error) {
      console.error("CREATE ORDER ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal membuat order Vilog");
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-5 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <section className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-white/[0.04] shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(6,182,212,0.18),transparent_38%)]" />

          <div className="relative grid min-h-[390px] gap-6 px-6 py-8 md:grid-cols-[1fr_420px] md:items-center md:px-8 lg:grid-cols-[1fr_470px]">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                🎮 Roblox Service
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                Vilog Roblox
                <span className="block text-cyan-400">Cepat & Aman</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 md:text-base">
                Pembelian vilog cepat, aman, dan terpercaya. Pilih paket, pilih
                metode pembayaran, upload bukti pembayaran, lalu buat order.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                  <ShieldCheck size={18} />
                  <span className="font-semibold">Aman</span>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                  <Clock3 size={18} />
                  <span className="font-semibold">Proses Cepat</span>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                  <CreditCard size={18} />
                  <span className="font-semibold">Bank / QRIS</span>
                </div>
              </div>
            </div>

            <div className="relative hidden h-[340px] items-end justify-center md:flex">
              <div className="absolute bottom-0 h-[280px] w-[280px] rounded-full bg-cyan-500/20 blur-[90px]" />

              <Image
                src="/images/char1.png"
                alt="Vilog Character"
                width={430}
                height={430}
                className="relative bottom-[-20px] z-10 h-[340px] w-auto translate-y-8 object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,255,255,0.25)]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold text-white">
            Pilih Paket Vilog
          </h2>

          {loadingProducts ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300 backdrop-blur-md">
              Loading produk vilog...
            </div>
          ) : vilogPackages.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300 backdrop-blur-md">
              Produk vilog belum tersedia.
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {vilogPackages.map((pkg, index) => {
                const active = selectedPackage?.id === pkg.id;
                const isFirstCard = index === 0;

                return (
                  <div
                    key={pkg.id}
                    className={`relative min-h-[230px] overflow-hidden rounded-[28px] border p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 ${
                      active
                        ? "border-cyan-400/50 bg-cyan-500/10 shadow-xl shadow-cyan-500/20"
                        : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:bg-cyan-500/5"
                    }`}
                  >
                    {isFirstCard && (
                      <>
                        <div className="absolute bottom-0 right-0 top-0 w-[46%] overflow-hidden rounded-r-[28px]">
                          <Image
                            src="/images/char1.png"
                            alt="Vilog Character"
                            width={230}
                            height={230}
                            className="absolute bottom-0 right-[-12px] h-[215px] w-auto object-contain object-bottom opacity-95"
                          />
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/95 to-[#07111f]/5" />
                      </>
                    )}

                    <div className="relative z-10 flex min-h-[190px] flex-col">
                      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                        <CircleDollarSign size={28} />
                      </div>

                      <h3
                        className={`mt-4 text-lg font-extrabold text-white ${
                          isFirstCard ? "max-w-[56%]" : ""
                        }`}
                      >
                        {pkg.namaProduk}
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-relaxed text-gray-400 ${
                          isFirstCard ? "max-w-[56%]" : ""
                        }`}
                      >
                        {pkg.deskripsi || "Paket Vilog Roblox"}
                      </p>

                      <h4 className="mt-4 text-xl font-extrabold text-cyan-400">
                        Rp {Number(pkg.harga).toLocaleString("id-ID")}
                      </h4>

                      <button
                        type="button"
                        onClick={() => getDetailVilogProduct(pkg.id)}
                        disabled={loadingDetail}
                        className={`mt-auto flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                          active
                            ? "bg-cyan-500 text-[#07111f]"
                            : "border border-white/10 bg-white/5 text-cyan-300 hover:bg-cyan-500 hover:text-[#07111f]"
                        }`}
                      >
                        <ShoppingCart size={18} />
                        {active ? "Paket Dipilih" : "Pilih Paket"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {selectedPackage && (
          <section className="mt-10 rounded-[30px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Form Order Vilog
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Paket dipilih:{" "}
                  <span className="font-bold text-cyan-400">
                    {selectedPackage.namaProduk}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-extrabold text-[#07111f] shadow-lg shadow-cyan-500/30">
                Rp {Number(selectedPackage.harga).toLocaleString("id-ID")}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Username Roblox"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              />

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10">
                <Lock size={18} className="text-cyan-400" />
                <input
                  type="password"
                  placeholder="Password Roblox"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {["backupCode1", "backupCode2", "backupCode3"].map(
                  (field, index) => (
                    <input
                      key={field}
                      type="text"
                      placeholder={`Backup Code ${index + 1}`}
                      value={form[field as keyof typeof form]}
                      onChange={(e) =>
                        setForm({ ...form, [field]: e.target.value })
                      }
                      className="rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                    />
                  )
                )}
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10">
                <Phone size={18} className="text-cyan-400" />
                <input
                  type="text"
                  placeholder="Kontak WhatsApp / Email"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>

              <input
                type="text"
                placeholder="Nomor Rekening / E-Wallet Pengirim"
                value={form.nomorRekening}
                onChange={(e) =>
                  setForm({ ...form, nomorRekening: e.target.value })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
              />

              <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-500/5 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Pilih Metode Pembayaran
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Pilih rekening bank atau QRIS yang tersedia.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={getPaymentMethods}
                    disabled={loadingPayments}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-[#07111f] disabled:opacity-50"
                  >
                    {loadingPayments ? "Loading..." : "Refresh Metode"}
                  </button>
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
                        const active =
                          String(selectedPaymentId) === String(method.id);
                        const isQris = method.metodePembayaran === "QRIS";

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedPaymentId(String(method.id))}
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
                                {isQris ? (
                                  <QrCode size={22} />
                                ) : (
                                  <Landmark size={22} />
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-extrabold text-white">
                                  {isQris
                                    ? "QRIS"
                                    : method.namaBank || "BANK"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {isQris
                                    ? "Scan QR untuk pembayaran"
                                    : method.namaPemilik || "-"}
                                </p>
                              </div>
                            </div>

                            {!isQris && (
                              <div className="mt-4 rounded-2xl bg-black/20 px-4 py-3">
                                <p className="text-xs text-gray-400">
                                  Nomor Rekening
                                </p>
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
                        <p className="text-sm font-bold text-emerald-300">
                          Instruksi Pembayaran
                        </p>

                        {selectedPayment.metodePembayaran === "QRIS" ? (
                          <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                            Scan QRIS di atas sesuai nominal{" "}
                            <span className="font-bold text-white">
                              Rp{" "}
                              {Number(selectedPackage.harga).toLocaleString(
                                "id-ID"
                              )}
                            </span>
                            , lalu upload bukti pembayaran.
                          </p>
                        ) : (
                          <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <PaymentInfo
                              label="Bank"
                              value={selectedPayment.namaBank || "-"}
                            />
                            <PaymentInfo
                              label="Nomor"
                              value={selectedPayment.nomorRekening || "-"}
                            />
                            <PaymentInfo
                              label="Pemilik"
                              value={selectedPayment.namaPemilik || "-"}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="rounded-[24px] border-2 border-dashed border-cyan-400/30 bg-cyan-500/5 p-4">
                <h3 className="text-lg font-extrabold text-white">
                  Upload Bukti Pembayaran
                </h3>

                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] p-6 text-center transition hover:bg-cyan-500/10">
                  <Upload size={34} className="text-cyan-400" />

                  <p className="mt-3 text-sm font-bold text-white">
                    Upload screenshot pembayaran
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    PNG, JPG, JPEG, atau WEBP
                  </p>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePaymentProofChange}
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
                    <span className="font-bold">{paymentProof.name}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleOrder}
                disabled={loadingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {loadingOrder ? "Membuat Order..." : "Buat Order Vilog"}
              </button>
            </div>
          </section>
        )}

        {createdOrder && (
          <section className="mt-10 rounded-[26px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
              <CreditCard size={24} className="text-cyan-400" />
              Order Berhasil
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-gray-400">Order ID</span>
                <span className="font-bold text-cyan-400">
                  {createdOrder.orderId}
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-gray-400">Status</span>
                <span className="font-bold text-cyan-400">
                  {createdOrder.status}
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function PaymentInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-black/20 px-4 py-3">
      <p className="text-xs text-emerald-200/70">{label}</p>
      <p className="mt-1 break-all text-sm font-bold text-white">{value}</p>
    </div>
  );
}

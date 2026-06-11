"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  ShieldCheck,
  Clock3,
  Gift,
  User,
  Link2,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Landmark,
  Map,
  MessageCircle,
  Send,
  X,
  Coins,
  Package,
  BadgeDollarSign,
} from "lucide-react";

type Rekening = {
  id: number;
  metodePembayaran: "BANK" | "QRIS" | string;
  namaBank?: string;
  nomorRekening?: string;
  namaPemilik?: string;
  qrisImage?: string;
  isActive?: boolean;
};

type GiftingRate = {
  id: number;
  rate: number;
  isActive?: boolean;
};

type CreatedOrder = {
  id?: number;
  orderId?: string;
  status?: string;
  usernamePenerima?: string;
  privateServerLink?: string | null;
  namaMap?: string;
  namaItem?: string;
  jumlahRobux?: number | string;
  totalRobux?: number | string;
  rate?: number;
  rateSaatIni?: number;
  totalPrice?: number;
  nomorRekening?: string;
  paymentProof?: string;
};

type ChatRoom = {
  id: number;
  orderId?: string;
  buyerName?: string;
  service?: string;
  status?: "waiting" | "accepted" | "closed" | string;
  isAccepted?: boolean;
  acceptedBy?: number | null;
  acceptedAt?: string | null;
};

type ChatMessage = {
  id: number;
  roomId: number;
  senderName: string;
  senderType: "buyer" | "admin" | "staff";
  message: string;
  createdAt?: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export default function GiftingPage() {
  const [paymentMethods, setPaymentMethods] = useState<Rekening[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const [rates, setRates] = useState<GiftingRate[]>([]);
  const [loadingRate, setLoadingRate] = useState(false);

  const [form, setForm] = useState({
    usernamePenerima: "",
    privateServerLink: "",
    namaMap: "",
    totalRobux: "",
    namaItem: "",
    nomorRekening: "",
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);

  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const selectedPayment = useMemo(() => {
    return paymentMethods.find(
      (item) => String(item.id) === String(selectedPaymentId)
    );
  }, [paymentMethods, selectedPaymentId]);

  const activeRate = useMemo(() => {
    return rates.find((item) => item.isActive !== false) || rates[0] || null;
  }, [rates]);

  const rateSaatIni = Number(activeRate?.rate || 0);

  const estimatedPrice = useMemo(() => {
    const robux = Number(form.totalRobux || 0);
    const rate = Number(rateSaatIni || 0);

    if (!robux || !rate) return 0;

    return robux * rate;
  }, [form.totalRobux, rateSaatIni]);

  const mapChatRoom = (room?: ChatRoom | null): ChatRoom | null => {
    if (!room) return null;

    return {
      ...room,
      status: room.isAccepted === true ? "accepted" : room.status || "waiting",
    };
  };

  const isRoomAccepted = (room?: ChatRoom | null) => {
    return Boolean(
      room?.isAccepted === true ||
        room?.status === "accepted" ||
        room?.acceptedBy ||
        room?.acceptedAt
    );
  };

  const isChatAccepted = isRoomAccepted(chatRoom);

  const hasBuyerSentFirstMessage = chatMessages.some(
    (item) => item.senderType === "buyer"
  );

  const isChatLocked = Boolean(
    chatRoom?.id && hasBuyerSentFirstMessage && !isChatAccepted
  );

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const safeJson = async (response: Response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Response server bukan JSON");
    }
  };

  const getFileUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_URL}/${cleanPath}`;
  };

  const getGiftingRate = async () => {
    try {
      setLoadingRate(true);

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

      const activeRates = Array.isArray(result.data)
        ? result.data.filter((item: GiftingRate) => item.isActive !== false)
        : [];

      setRates(activeRates);
    } catch (error) {
      console.error("GET GIFTING RATE ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal mengambil rate gifting");
    } finally {
      setLoadingRate(false);
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

  const fetchMessages = async (roomId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${roomId}/messages`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil pesan chat");
      }

      setChatMessages(result.data || []);

      if (result.room) {
        const mappedRoom = mapChatRoom(result.room);
        setChatRoom(mappedRoom);

        if (mappedRoom && typeof window !== "undefined") {
          localStorage.setItem("gifting_chat_room", JSON.stringify(mappedRoom));
        }
      }
    } catch (error) {
      console.error("GET GIFTING CHAT MESSAGES ERROR:", error);
      setChatMessages([]);
    }
  };

  useEffect(() => {
    getPaymentMethods();
    getGiftingRate();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedRoom = localStorage.getItem("gifting_chat_room");

    if (!savedRoom) return;

    try {
      const room = JSON.parse(savedRoom) as ChatRoom;

      if (!room?.id) return;

      const mappedRoom = mapChatRoom(room);
      setChatRoom(mappedRoom);

      if (mappedRoom) {
        localStorage.setItem("gifting_chat_room", JSON.stringify(mappedRoom));
      }

      fetchMessages(room.id);

      const interval = setInterval(() => {
        fetchMessages(room.id);
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error("PARSE GIFTING CHAT ROOM ERROR:", error);
      localStorage.removeItem("gifting_chat_room");
    }
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

  const createChatRoom = async () => {
    try {
      if (typeof window !== "undefined") {
        const savedRoom = localStorage.getItem("gifting_chat_room");

        if (savedRoom) {
          const parsedRoom = JSON.parse(savedRoom) as ChatRoom;

          if (parsedRoom?.id) {
            const mappedRoom = mapChatRoom(parsedRoom);
            setChatRoom(mappedRoom);

            if (mappedRoom) {
              localStorage.setItem(
                "gifting_chat_room",
                JSON.stringify(mappedRoom)
              );
            }

            return mappedRoom;
          }
        }
      }

      const response = await fetch(`${API_URL}/api/chat/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          buyerName: form.usernamePenerima || "Customer Gifting",
          orderId: createdOrder?.orderId || `PRE-GIFT-${Date.now()}`,
          service: "gifting",
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat room chat");
      }

      const mappedRoom = mapChatRoom(result.data);
      setChatRoom(mappedRoom);

      if (mappedRoom && typeof window !== "undefined") {
        localStorage.setItem("gifting_chat_room", JSON.stringify(mappedRoom));
      }

      return mappedRoom as ChatRoom;
    } catch (error) {
      console.error("CREATE GIFTING CHAT ROOM ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal membuat room chat");
      return null;
    }
  };

  const updateChatRoomOrderId = async (orderId: string) => {
    try {
      const room = chatRoom || (await createChatRoom());

      if (!room?.id) return;

      const response = await fetch(`${API_URL}/api/chat/rooms/${room.id}/order`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          orderId,
          buyerName:
            form.usernamePenerima || room.buyerName || "Customer Gifting",
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal update Order ID chat");
      }

      const mappedRoom = mapChatRoom(result.data);
      setChatRoom(mappedRoom);

      if (mappedRoom && typeof window !== "undefined") {
        localStorage.setItem("gifting_chat_room", JSON.stringify(mappedRoom));
      }
    } catch (error) {
      console.error("UPDATE GIFTING CHAT ORDER ERROR:", error);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;

    if (isChatLocked) {
      alert("Chat sudah terkirim. Tunggu admin menerima chat terlebih dahulu.");
      return;
    }

    try {
      setLoadingChat(true);

      let room = chatRoom;

      if (!room) {
        room = await createChatRoom();
      }

      if (!room?.id) return;

      const response = await fetch(`${API_URL}/api/chat/buyer/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          roomId: room.id,
          senderName: form.usernamePenerima || "Customer",
          message: chatInput.trim(),
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim pesan");
      }

      setChatInput("");
      await fetchMessages(room.id);
    } catch (error) {
      console.error("SEND GIFTING CHAT ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal mengirim pesan");
    } finally {
      setLoadingChat(false);
    }
  };

  const handleOrder = async () => {
    if (!rateSaatIni || rateSaatIni <= 0) {
      alert("Rate gifting aktif belum tersedia. Hubungi admin.");
      return;
    }

    if (!form.usernamePenerima.trim()) {
      alert("Username penerima wajib diisi");
      return;
    }

    if (!form.namaMap.trim()) {
      alert("Nama map wajib diisi");
      return;
    }

    if (!form.totalRobux || Number(form.totalRobux) <= 0) {
      alert("Total robux wajib lebih dari 0");
      return;
    }

    if (!form.namaItem.trim()) {
      alert("Nama item / gamepass wajib diisi");
      return;
    }

    if (!selectedPayment) {
      alert("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    if (!form.nomorRekening.trim()) {
      alert("Nomor rekening / e-wallet pengirim wajib diisi");
      return;
    }

    if (!paymentProof) {
      alert("Upload bukti pembayaran terlebih dahulu");
      return;
    }

    try {
      setLoadingOrder(true);

      const formData = new FormData();

      formData.append("usernamePenerima", form.usernamePenerima.trim());
      formData.append("namaMap", form.namaMap.trim());
      formData.append("namaItem", form.namaItem.trim());
      formData.append("jumlahRobux", String(form.totalRobux));
      formData.append("nomorRekening", form.nomorRekening.trim());

      if (form.privateServerLink.trim()) {
        formData.append("privateServerLink", form.privateServerLink.trim());
      }

      formData.append("paymentProof", paymentProof);

      const response = await fetch(`${API_URL}/api/gifting/order`, {
        method: "POST",
        body: formData,
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat order gifting");
      }

      const orderData = result.data as CreatedOrder;

      setCreatedOrder({
        ...orderData,
        totalRobux: orderData.jumlahRobux || form.totalRobux,
        rateSaatIni: orderData.rate || rateSaatIni,
      });

      if (orderData.orderId) {
        await updateChatRoomOrderId(orderData.orderId);
      }

      setShowInvoice(true);
    } catch (error) {
      console.error("CREATE GIFTING ORDER ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal membuat order");
    } finally {
      setLoadingOrder(false);
    }
  };

  const resetOrderForm = () => {
    setShowInvoice(false);
    setCreatedOrder(null);
    setForm({
      usernamePenerima: "",
      privateServerLink: "",
      namaMap: "",
      totalRobux: "",
      namaItem: "",
      nomorRekening: "",
    });
    setPaymentProof(null);
    setPaymentPreview(null);
  };

  if (showInvoice && createdOrder) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-5 py-10 text-white">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

        <section className="relative z-10 mx-auto max-w-3xl rounded-[32px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-cyan-400" size={64} />
            <h1 className="mt-4 text-3xl font-extrabold">Invoice Order</h1>
            <p className="mt-2 text-sm text-gray-400">
              Order gifting berhasil dibuat. Simpan Order ID untuk cek transaksi.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <InvoiceRow label="Order ID" value={createdOrder.orderId || "-"} />
            <InvoiceRow label="Status" value={createdOrder.status || "pending"} />
            <InvoiceRow
              label="Username Penerima"
              value={createdOrder.usernamePenerima || "-"}
            />
            <InvoiceRow label="Nama Map" value={createdOrder.namaMap || "-"} />
            <InvoiceRow
              label="Total Robux"
              value={`${Number(
                createdOrder.totalRobux || createdOrder.jumlahRobux || 0
              ).toLocaleString("id-ID")} Robux`}
            />
            <InvoiceRow label="Nama Item" value={createdOrder.namaItem || "-"} />
            <InvoiceRow
              label="Rate Saat Ini"
              value={`Rp ${Number(
                createdOrder.rateSaatIni || createdOrder.rate || 0
              ).toLocaleString("id-ID")} / Robux`}
            />
            <InvoiceRow
              label="Estimasi Total"
              value={`Rp ${Number(
                createdOrder.totalPrice ||
                  Number(createdOrder.totalRobux || createdOrder.jumlahRobux || 0) *
                    Number(createdOrder.rateSaatIni || createdOrder.rate || 0)
              ).toLocaleString("id-ID")}`}
            />
            <InvoiceRow
              label="Private Server"
              value={createdOrder.privateServerLink || "-"}
            />
            <InvoiceRow
              label="Nomor Pengirim"
              value={createdOrder.nomorRekening || "-"}
            />
            <InvoiceRow
              label="Metode Pembayaran"
              value={
                selectedPayment?.metodePembayaran === "QRIS"
                  ? "QRIS"
                  : `${selectedPayment?.namaBank || "BANK"} - ${
                      selectedPayment?.nomorRekening || "-"
                    }`
              }
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                (window.location.href = `/cek-transaksi?orderId=${createdOrder.orderId}`)
              }
              className="flex-1 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-extrabold text-[#07111f] transition hover:bg-cyan-400"
            >
              Cek Transaksi
            </button>

            <button
              type="button"
              onClick={resetOrderForm}
              className="flex-1 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Buat Order Baru
            </button>
          </div>
        </section>
      </main>
    );
  }

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
                🎁 Roblox Gifting
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                Gifting Roblox
                <span className="block text-cyan-400">Cepat & Aman</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 md:text-base">
                Isi username penerima, nama map, total robux, nama item, link
                private server jika ada, pilih metode pembayaran, upload bukti
                pembayaran, lalu admin akan segera memproses order kamu.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Badge icon={<ShieldCheck size={18} />} label="Aman" />
                <Badge icon={<Clock3 size={18} />} label="Proses Cepat" />
                <Badge icon={<Gift size={18} />} label="Instant Gift" />
              </div>
            </div>

            <div className="relative hidden h-[340px] items-end justify-center md:flex">
              <div className="absolute bottom-0 h-[280px] w-[280px] rounded-full bg-cyan-500/20 blur-[90px]" />

              <Image
                src="/images/Char3.png"
                alt="Gifting Character"
                width={430}
                height={430}
                className="relative bottom-[-20px] z-10 h-[340px] w-auto translate-y-8 object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,255,255,0.25)]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[30px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Form Order Gifting
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Isi data order gifting dengan benar.
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-extrabold text-[#07111f] shadow-lg shadow-cyan-500/30">
              Gifting Order
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-500/10 p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="flex items-center gap-2 text-sm font-bold text-cyan-200">
                    <BadgeDollarSign size={18} />
                    Rate saat ini:
                  </p>

                  <p className="mt-2 text-2xl font-extrabold text-cyan-300">
                    {loadingRate
                      ? "Loading..."
                      : `Rp ${Number(rateSaatIni || 0).toLocaleString(
                          "id-ID"
                        )} / Robux`}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Rate ini diambil otomatis dari dashboard admin dan tidak
                    bisa diedit buyer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={getGiftingRate}
                  disabled={loadingRate}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-[#07111f] disabled:opacity-50"
                >
                  {loadingRate ? "Loading..." : "Refresh Rate"}
                </button>
              </div>
            </div>

            <InputBox icon={<User size={18} />}>
              <input
                type="text"
                placeholder="Username Penerima"
                value={form.usernamePenerima}
                onChange={(e) =>
                  setForm({ ...form, usernamePenerima: e.target.value })
                }
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </InputBox>

            <InputBox icon={<Map size={18} />}>
              <input
                type="text"
                placeholder="Nama Map"
                value={form.namaMap}
                onChange={(e) => setForm({ ...form, namaMap: e.target.value })}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </InputBox>

            <InputBox icon={<Coins size={18} />}>
              <input
                type="number"
                placeholder="Total Robux"
                value={form.totalRobux}
                onChange={(e) =>
                  setForm({ ...form, totalRobux: e.target.value })
                }
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </InputBox>

            <InputBox icon={<Package size={18} />}>
              <input
                type="text"
                placeholder="Nama Item / Gamepass"
                value={form.namaItem}
                onChange={(e) => setForm({ ...form, namaItem: e.target.value })}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </InputBox>

            {estimatedPrice > 0 && (
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-sm font-bold text-emerald-300">
                  Estimasi Total Pembayaran
                </p>
                <p className="mt-1 text-2xl font-extrabold text-white">
                  Rp {estimatedPrice.toLocaleString("id-ID")}
                </p>
                <p className="mt-1 text-xs text-emerald-100/70">
                  Perhitungan: {Number(form.totalRobux).toLocaleString("id-ID")}{" "}
                  Robux x Rp {Number(rateSaatIni).toLocaleString("id-ID")}
                </p>
              </div>
            )}

            <div>
              <InputBox icon={<Link2 size={18} />}>
                <input
                  type="text"
                  placeholder="Link Private Server jika ada"
                  value={form.privateServerLink}
                  onChange={(e) =>
                    setForm({ ...form, privateServerLink: e.target.value })
                  }
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </InputBox>

              <div className="mt-2 flex items-start gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>
                  Jika tidak punya link private server, kosongkan saja. Admin
                  akan mengirimkan link private server.
                </p>
              </div>
            </div>

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
                                {isQris ? "QRIS" : method.namaBank || "BANK"}
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
                          Scan QRIS di atas sesuai nominal order, lalu upload
                          bukti pembayaran.
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

            <InputBox icon={<CreditCard size={18} />}>
              <input
                type="text"
                placeholder="Nomor Rekening / E-Wallet Pengirim"
                value={form.nomorRekening}
                onChange={(e) =>
                  setForm({ ...form, nomorRekening: e.target.value })
                }
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </InputBox>

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
              {loadingOrder ? "Membuat Order..." : "Buat Order Gifting"}
            </button>
          </div>
        </section>
      </div>

      <button
        type="button"
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-[#07111f] shadow-2xl shadow-cyan-500/40 transition hover:scale-105"
      >
        <MessageCircle size={28} />
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[calc(100vw-32px)] max-w-[380px] flex-col overflow-hidden rounded-[30px] border border-cyan-500/20 bg-[#07111f] shadow-[0_0_40px_rgba(0,255,255,0.15)] md:right-6">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="font-bold text-white">Live Chat Gifting</h3>
              <p className="text-xs text-gray-400">
                {isChatAccepted
                  ? "Chat diterima Admin"
                  : "Menunggu Admin menerima"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowChat(false)}
              className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#081423] p-4">
            {chatMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
                Belum ada pesan. Kamu hanya bisa mengirim 1 pesan awal. Setelah
                itu tunggu admin menerima chat.
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${
                    msg.senderType === "buyer"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-[24px] px-4 py-3 text-sm ${
                      msg.senderType === "buyer"
                        ? "bg-cyan-500 text-[#07111f]"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="mb-1 text-[10px] font-bold opacity-60">
                      {msg.senderName}
                    </p>
                    <p className="break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            {isChatLocked && (
              <div className="mb-3 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-xs leading-5 text-yellow-200">
                Pesan awal sudah dikirim. Chat akan aktif lagi setelah admin
                menerima chat ini.
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendChat();
                  }
                }}
                placeholder={
                  isChatLocked
                    ? "Menunggu admin menerima chat..."
                    : "Tulis pesan..."
                }
                disabled={isChatLocked}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                type="button"
                onClick={sendChat}
                disabled={loadingChat || isChatLocked}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-[#07111f] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
      {icon}
      <span className="font-semibold">{label}</span>
    </div>
  );
}

function InputBox({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10">
      <span className="text-cyan-400">{icon}</span>
      {children}
    </div>
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

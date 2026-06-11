"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  ShieldCheck,
  Clock3,
  Crown,
  Skull,
  Search,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

import LimsChat from "@/components/lims/LimsChat";
import FormDataOrderLims from "@/components/forms/FormDataOrderLims";

import {
  createChatRoomApi,
  createLimsOrderApi,
  getChatMessagesApi,
  getLimsProductDetail,
  getLimsProducts,
  sendBuyerMessageApi,
} from "@/lib/limsApi";

import {
  ChatMessage,
  ChatRoom,
  CreatedOrder,
  LimsPackage,
} from "@/app/types/lims";

type PackageCategory = "limited" | "tumbal";

export type SelectedLimsPackage = LimsPackage & {
  kategori: PackageCategory;
};

type RobloxCatalogItemRaw = {
  id?: number;
  name?: string;
  price?: number;
  lowestPrice?: number;
  itemRestrictions?: string[];
  collectibleItemId?: string;
};

type RobloxThumbnailRaw = {
  targetId?: number;
  imageUrl?: string;
  state?: string;
};

type TumbalItem = {
  id: number;
  namaItem: string;
  assetId: string;
  harga: number;
  robloxImage: string;
  marketplaceUrl: string;
  isLimited: boolean;
  isRobloxItem: boolean;
};

const MIN_TUMBAL_PRICE = 100;
const MAX_TUMBAL_PRICE = 300;

const getRobloxMarketplaceUrl = (assetId: string | number) => {
  return `https://www.roblox.com/catalog/${assetId}`;
};

const getItemPrice = (item: RobloxCatalogItemRaw) => {
  return Number(item.lowestPrice ?? item.price ?? 0);
};

const isLimitedRobloxItemItem = (item: RobloxCatalogItemRaw) => {
  const restrictions = item.itemRestrictions || [];

  const hasLimitedRestriction =
    restrictions.includes("Limited") ||
    restrictions.includes("LimitedUnique") ||
    restrictions.includes("Collectible");

  const price = getItemPrice(item);

  return (
    Boolean(item.id) &&
    hasLimitedRestriction &&
    price >= MIN_TUMBAL_PRICE &&
    price <= MAX_TUMBAL_PRICE
  );
};

async function getRobloxTumbalItemsApi(): Promise<TumbalItem[]> {
  const fixedItems = [
    {
      id: 4771699155,
      namaItem: "Egg of Hidden Treasures",
    },
    {
      id: 1556204905,
      namaItem: "Inkwell Egg",
    },
    {
      id: 2528066922,
      namaItem: "Catrin Dia de Muertos Mask",
    },
    {
      id: 4773569689,
      namaItem: "Epic Egg",
    },
    {
      id: 4773591735,
      namaItem: "Saber Boss Egg",
    },
    {
      id: 4786877411,
      namaItem: "Tiny Tank Egg",
    },
  ];

  return fixedItems.map((item) => {
    const assetId = String(item.id);

    return {
      id: item.id,
      namaItem: item.namaItem,
      assetId,
      harga: 0,
      robloxImage: `/api/roblox-thumbnail?assetId=${assetId}`,
      marketplaceUrl: `https://www.roblox.com/catalog/${assetId}`,
      isLimited: true,
      isRobloxItem: true,
    };
  });
}

export default function LimitedItemPage() {
  const router = useRouter();

  const [limsPackages, setLimsPackages] = useState<LimsPackage[]>([]);
  const [tumbalItems, setTumbalItems] = useState<TumbalItem[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<PackageCategory | null>(null);

  const [selectedPackage, setSelectedPackage] =
    useState<SelectedLimsPackage | null>(null);

  const [form, setForm] = useState({
    robloxUsername: "",
    nomorRekening: "",
  });

  const [search, setSearch] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);

  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);

  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingTumbal, setLoadingTumbal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const limitedItems = limsPackages.filter((item) =>
    item.namaItem.toLowerCase().includes(search.toLowerCase())
  );

  const tumbalList = useMemo(() => {
    return tumbalItems.filter((item) =>
      item.namaItem.toLowerCase().includes(search.toLowerCase())
    );
  }, [tumbalItems, search]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getLimsProducts();
      setLimsPackages(data);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil produk");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadTumbalItems = async () => {
    try {
      setLoadingTumbal(true);

      const data = await getRobloxTumbalItemsApi();

      setTumbalItems(data);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil item tumbal dari Roblox"
      );
    } finally {
      setLoadingTumbal(false);
    }
  };

  const handleSelectCategory = async (category: PackageCategory) => {
    setSelectedCategory(category);
    setSelectedPackage(null);
    setSearch("");
    setPaymentProof(null);
    setPaymentPreview(null);

    if (category === "tumbal") {
      await loadTumbalItems();
    }

    setTimeout(() => {
      document
        .getElementById("daftar-item-lims")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleSearchRobloxTumbal = async () => {
    await loadTumbalItems();
  };

  const selectLimitedItem = async (id: number) => {
    try {
      setLoadingDetail(true);

      const data = await getLimsProductDetail(id);

      setSelectedPackage({
        ...data,
        kategori: "limited",
      });

      setPaymentProof(null);
      setPaymentPreview(null);

      setTimeout(() => {
        document
          .getElementById("form-order-lims")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal mengambil detail produk"
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const createChatRoom = async (orderId?: string) => {
    try {
      const room = await createChatRoomApi({
        orderId,
        buyerName: form.robloxUsername || "Buyer",
      });

      setChatRoom(room);
      localStorage.setItem("lims_chat_room", JSON.stringify(room));

      const messages = await getChatMessagesApi(room.id);
      setChatMessages(messages);
      localStorage.setItem("lims_chat_messages", JSON.stringify(messages));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membuat room chat");
    }
  };

  const sendBuyerMessage = async () => {
    if (!chatRoom) {
      alert("Room chat belum dibuat");
      return;
    }

    if (!chatInput.trim()) {
      alert("Pesan tidak boleh kosong");
      return;
    }

    try {
      setLoadingChat(true);

      await sendBuyerMessageApi({
        roomId: chatRoom.id,
        senderName: form.robloxUsername || "Buyer",
        message: chatInput.trim(),
      });

      setChatInput("");

      const messages = await getChatMessagesApi(chatRoom.id);
      setChatMessages(messages);
      localStorage.setItem("lims_chat_messages", JSON.stringify(messages));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengirim pesan");
    } finally {
      setLoadingChat(false);
    }
  };

  const handleOrder = async () => {
    if (!selectedPackage) {
      alert("Pilih item terlebih dahulu");
      return;
    }

    if (!form.robloxUsername || !form.nomorRekening) {
      alert("Username Roblox dan nomor rekening wajib diisi");
      return;
    }

    try {
      setLoadingOrder(true);

      const formData = new FormData();

      formData.append("produkId", String(selectedPackage.id));
      formData.append("limsProdukId", String(selectedPackage.id));
      formData.append("namaItem", selectedPackage.namaItem);
      formData.append("assetId", selectedPackage.assetId);
      formData.append("harga", String(selectedPackage.harga));
      formData.append("kategori", selectedPackage.kategori);
      formData.append("robloxUsername", form.robloxUsername);
      formData.append("nomorRekening", form.nomorRekening);

      if (paymentProof) {
        formData.append("paymentProof", paymentProof);
      }

      const data = await createLimsOrderApi(formData);

      const order: CreatedOrder = {
        id: data?.id,
        orderId: data?.orderId,
        status: data?.status,
      };

      setCreatedOrder(order);
      localStorage.setItem("lims_created_order", JSON.stringify(order));

      await createChatRoom(order.orderId);

      router.push(`/cek-transaksi?orderId=${order.orderId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membuat order LIMS");
    } finally {
      setLoadingOrder(false);
    }
  };

  useEffect(() => {
    loadProducts();

    const savedOrder = localStorage.getItem("lims_created_order");
    const savedRoom = localStorage.getItem("lims_chat_room");
    const savedMessages = localStorage.getItem("lims_chat_messages");

    if (savedOrder) {
      try {
        setCreatedOrder(JSON.parse(savedOrder));
      } catch {
        localStorage.removeItem("lims_created_order");
      }
    }

    if (savedRoom) {
      try {
        const room: ChatRoom = JSON.parse(savedRoom);
        setChatRoom(room);

        getChatMessagesApi(room.id)
          .then((messages) => {
            setChatMessages(messages);
            localStorage.setItem(
              "lims_chat_messages",
              JSON.stringify(messages)
            );
          })
          .catch(() => {
            if (savedMessages) {
              setChatMessages(JSON.parse(savedMessages));
            }
          });
      } catch {
        localStorage.removeItem("lims_chat_room");
      }
    }
  }, []);

  useEffect(() => {
    if (!chatRoom?.id) return;

    const interval = setInterval(async () => {
      try {
        const messages = await getChatMessagesApi(chatRoom.id);
        setChatMessages(messages);
        localStorage.setItem("lims_chat_messages", JSON.stringify(messages));
      } catch {
        const savedMessages = localStorage.getItem("lims_chat_messages");

        if (savedMessages) {
          setChatMessages(JSON.parse(savedMessages));
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [chatRoom?.id]);

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
                👑 Roblox Limited Item
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                Limited Item
                <span className="block text-cyan-400">Cepat & Aman</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 md:text-base">
                Pilih paket LIMS, pilih item limited atau tumbal, lalu buat
                order dengan proses cepat, aman, dan terpercaya.
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
                  <Crown size={18} />
                  <span className="font-semibold">Bisa Dibeli Kapan Saja</span>
                </div>
              </div>
            </div>

            <div className="relative hidden h-[340px] items-end justify-center md:flex">
              <div className="absolute bottom-0 h-[280px] w-[280px] rounded-full bg-cyan-500/20 blur-[90px]" />

              <Image
                src="/images/char1.png"
                alt="Limited Item Character"
                width={430}
                height={430}
                className="relative z-10 h-[340px] w-auto translate-y-8 object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,255,255,0.25)]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold text-white">
            Pilih Paket LIMS
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSelectCategory("limited")}
              className={`relative overflow-hidden rounded-[28px] border p-5 text-left backdrop-blur-md transition duration-300 hover:-translate-y-1 ${
                selectedCategory === "limited"
                  ? "border-cyan-400/50 bg-cyan-500/10 shadow-xl shadow-cyan-500/20"
                  : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:bg-cyan-500/5"
              }`}
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                <Crown size={30} />
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-white">
                Item Limited
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Item limited bisa dibeli kapan saja melalui form order
                PrimeBlox. Gambar otomatis berdasarkan Asset ID.
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-cyan-300">
                {limsPackages.length} item tersedia
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory("tumbal")}
              disabled={loadingTumbal}
              className={`relative overflow-hidden rounded-[28px] border p-5 text-left backdrop-blur-md transition duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60 ${
                selectedCategory === "tumbal"
                  ? "border-cyan-400/50 bg-cyan-500/10 shadow-xl shadow-cyan-500/20"
                  : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:bg-cyan-500/5"
              }`}
            >
              <div className="flex h-[56px] w-[56px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                <Skull size={30} />
              </div>

              <h3 className="mt-5 text-2xl font-extrabold text-white">
                Item Tumbal
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Item tumbal membuka marketplace publik Roblox. Gambar diambil dari
                Roblox Thumbnail API melalui proxy agar lebih stabil.
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-cyan-300">
                {loadingTumbal
                  ? "Mengambil dari Roblox..."
                  : `${tumbalItems.length} item Roblox tersedia`}
              </div>
            </button>
          </div>
        </section>

        {selectedCategory && (
          <section id="daftar-item-lims" className="mt-10">
            <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  {selectedCategory === "limited"
                    ? "Daftar Item Limited"
                    : "Daftar Item Tumbal Roblox"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {selectedCategory === "limited"
                    ? "Item limited bisa dibeli kapan saja. Pilih item untuk melanjutkan ke form order."
                    : `Menampilkan item tumbal pilihan. Klik item untuk buka marketplace Roblox.`}
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 shadow-sm md:w-[360px]">
                  <Search size={20} className="text-cyan-400" />
                  <input
                    type="text"
                    placeholder={
                      selectedCategory === "limited"
                        ? "Cari item limited..."
                        : "Cari item tumbal..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        selectedCategory === "tumbal"
                      ) {
                        handleSearchRobloxTumbal();
                      }
                    }}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                  />
                </div>

                {selectedCategory === "tumbal" && (
                  <button
                    type="button"
                    onClick={handleSearchRobloxTumbal}
                    disabled={loadingTumbal}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-[#07111f] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      size={18}
                      className={loadingTumbal ? "animate-spin" : ""}
                    />
                    Refresh Item
                  </button>
                )}
              </div>
            </div>

            {selectedCategory === "limited" && (
              <>
                {loadingProducts ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300 backdrop-blur-md">
                    Loading item limited...
                  </div>
                ) : limitedItems.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-gray-400 backdrop-blur-md">
                    Item limited tidak ditemukan.
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-3">
                    {limitedItems.map((item, index) => {
                      const active =
                        selectedPackage?.kategori === "limited" &&
                        selectedPackage?.id === item.id;

                      const isFirstCard = index === 0;

                      return (
                        <div
                          key={item.id}
                          className={`relative min-h-[430px] overflow-hidden rounded-[28px] border p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 ${
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
                                  alt="Limited Character"
                                  width={230}
                                  height={230}
                                  className="absolute bottom-[-18px] right-[-12px] h-[215px] w-auto object-contain object-bottom opacity-95"
                                />
                              </div>

                              <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/95 to-[#07111f]/5" />
                            </>
                          )}

                          <div className="relative z-10 flex min-h-[390px] flex-col">
                            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                              <Crown size={28} />
                            </div>

                            <div className="mt-5 flex h-[190px] w-full items-center justify-center rounded-3xl border border-white/10 bg-[#07111f]/70 p-4">
                              {item.assetId ? (
                                <img
                                  src={`/api/roblox-thumbnail?assetId=${item.assetId}`}
                                  alt={item.namaItem}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = "/images/char1.png";
                                  }}
                                  className="h-[165px] w-[165px] max-w-full object-contain transition duration-300 hover:scale-105"
                                />
                              ) : (
                                <Crown size={76} className="text-cyan-400" />
                              )}
                            </div>

                            <span className="mt-4 w-fit rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                              Item Limited
                            </span>

                            <p
                              className={`mt-3 text-xs text-gray-400 ${
                                ""
                              }`}
                            >
                              Asset ID: {item.assetId}
                            </p>

                            <h3
                              className={`mt-3 text-lg font-extrabold text-white ${
                                ""
                              }`}
                            >
                              {item.namaItem}
                            </h3>

                            <h4 className="mt-4 text-xl font-extrabold text-cyan-400">
                              Rp {Number(item.harga).toLocaleString("id-ID")}
                            </h4>

                            <button
                              type="button"
                              onClick={() => selectLimitedItem(item.id)}
                              disabled={loadingDetail}
                              className={`mt-auto flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                                active
                                  ? "bg-cyan-500 text-[#07111f]"
                                  : "border border-white/10 bg-white/5 text-cyan-300 hover:bg-cyan-500 hover:text-[#07111f]"
                              }`}
                            >
                              {active ? (
                                <>
                                  <CheckCircle2 size={18} />
                                  Item Dipilih
                                </>
                              ) : (
                                <>
                                  <ShoppingCart size={18} />
                                  Pilih Item
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {selectedCategory === "tumbal" && (
              <>
                {loadingTumbal ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300 backdrop-blur-md">
                    Mengambil item tumbal Roblox...
                  </div>
                ) : tumbalList.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-gray-400 backdrop-blur-md">
                    Item tumbal Roblox tidak ditemukan.
                  </div>
                ) : (
                  <div className="grid gap-5 md:grid-cols-3">
                    {tumbalList.map((item) => {
                      return (
                        <a
                          key={`tumbal-${item.id}`}
                          href={item.marketplaceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative min-h-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-500/5"
                        >
                          <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
                            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
                          </div>

                          <div className="relative z-10 flex min-h-[320px] flex-col">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                                <Skull size={28} />
                              </div>

                              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                                Roblox Item
                              </span>
                            </div>

                            <div className="mt-5 flex h-[150px] items-center justify-center rounded-3xl border border-white/10 bg-[#07111f]/70 p-3">
                              {item.robloxImage ? (
                                <img
                                  src={item.robloxImage}
                                  alt={item.namaItem}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = "/images/char1.png";
                                  }}
                                  className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <Skull size={56} className="text-cyan-400" />
                              )}
                            </div>

                            <span className="mt-4 w-fit rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                              Item Tumbal
                            </span>

                            <p className="mt-3 text-xs text-gray-400">
                              Asset ID: {item.assetId}
                            </p>

                            <h3 className="mt-3 line-clamp-2 text-lg font-extrabold text-white">
                              {item.namaItem}
                            </h3>

                            <h4 className="mt-4 text-sm font-semibold text-cyan-300">
                              Klik untuk buka marketplace Roblox
                            </h4>

                            <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-cyan-300 transition group-hover:bg-cyan-500 group-hover:text-[#07111f]">
                              <ExternalLink size={18} />
                              Buka Marketplace Roblox
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {selectedPackage && selectedPackage.kategori === "limited" && (
          <div id="form-order-lims" className="mt-10">
            <FormDataOrderLims
              form={form}
              setForm={setForm}
              selectedPackage={selectedPackage}
              paymentProof={paymentProof}
              paymentPreview={paymentPreview}
              setPaymentProof={setPaymentProof}
              setPaymentPreview={setPaymentPreview}
              loadingOrder={loadingOrder}
              onSubmit={handleOrder}
            />
          </div>
        )}

        <LimsChat
          createdOrder={createdOrder}
          chatRoom={chatRoom}
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          showChat={showChat}
          setShowChat={setShowChat}
          loadingChat={loadingChat}
          onSend={async () => {
            if (!chatRoom) {
              await createChatRoom();
              return;
            }

            await sendBuyerMessage();
          }}
        />
      </div>
    </main>
  );
}

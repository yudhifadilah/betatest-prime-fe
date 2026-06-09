"use client";

import { useState } from "react";
import { Lock, ShoppingCart, User } from "lucide-react";

type VilogOrderFormProps = {
  productName: string;
  totalPrice: number;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

export default function VilogOrderForm({
  productName,
  totalPrice,
}: VilogOrderFormProps) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
    backupCode1: "",
    backupCode2: "",
    backupCode3: "",
    contact: "",
  });

  const handleOrder = async () => {
    if (
      !form.username ||
      !form.password ||
      !form.backupCode1 ||
      !form.backupCode2 ||
      !form.backupCode3 ||
      !form.contact
    ) {
      alert("Semua form wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          productType: "vilog",
          productName,
          totalPrice,

          robloxUsername: form.username,
          buyerName: form.username,
          buyerEmail: form.contact,

          vilogData: {
            username: form.username,
            password: form.password,
            backupCodes: [
              form.backupCode1,
              form.backupCode2,
              form.backupCode3,
            ],
          },
        }),
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Response bukan JSON dari: ${API_URL}/api/orders`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Gagal membuat order");
      }

      alert("Order Vilog berhasil dibuat");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal membuat order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-8 rounded-[32px] bg-white p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-black">Form Vilog</h2>

      <div className="mt-5 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Username Roblox
          </label>

          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-5 py-4">
            <User size={20} className="text-neutral-400" />
            <input
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value,
                })
              }
              placeholder="Masukkan username Roblox"
              className="w-full bg-transparent text-black outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-neutral-700">
            Password Roblox
          </label>

          <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-5 py-4">
            <Lock size={20} className="text-neutral-400" />
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
              placeholder="Masukkan password Roblox"
              className="w-full bg-transparent text-black outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={form.backupCode1}
            onChange={(e) =>
              setForm({
                ...form,
                backupCode1: e.target.value,
              })
            }
            placeholder="Backup Code 1"
            className="rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
          />

          <input
            value={form.backupCode2}
            onChange={(e) =>
              setForm({
                ...form,
                backupCode2: e.target.value,
              })
            }
            placeholder="Backup Code 2"
            className="rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
          />

          <input
            value={form.backupCode3}
            onChange={(e) =>
              setForm({
                ...form,
                backupCode3: e.target.value,
              })
            }
            placeholder="Backup Code 3"
            className="rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
          />
        </div>

        <input
          value={form.contact}
          onChange={(e) =>
            setForm({
              ...form,
              contact: e.target.value,
            })
          }
          placeholder="Kontak WhatsApp / Email"
          className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
        />

        <button
          type="button"
          onClick={handleOrder}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 font-semibold text-white disabled:opacity-50"
        >
          <ShoppingCart size={20} />
          {loading ? "Membuat order..." : "Buat Order Vilog"}
        </button>
      </div>
    </section>
  );
}
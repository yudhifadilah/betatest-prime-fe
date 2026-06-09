"use client";

import { useState } from "react";

type Product = {
  id: number;
  name: string;
  type: string;
  price: number;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Vilog Basic",
      type: "vilog",
      price: 10000,
    },
    {
      id: 2,
      name: "Payout 500",
      type: "payout",
      price: 70000,
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    type: "vilog",
    price: "",
  });

  const addProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setProducts([
      ...products,
      {
        id: Date.now(),
        name: form.name,
        type: form.type,
        price: Number(form.price),
      },
    ]);

    setForm({
      name: "",
      type: "vilog",
      price: "",
    });
  };

  const deleteProduct = (id: number) => {
    setProducts(products.filter((item) => item.id !== id));
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-black">Manajemen Produk</h1>

      <form
        onSubmit={addProduct}
        className="mt-8 grid gap-4 rounded-[28px] bg-white p-6 shadow-sm md:grid-cols-4"
      >
        <input
          placeholder="Nama produk"
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
            })
          }
          className="rounded-2xl border px-5 py-4 text-black"
          required
        />

        <select
          value={form.type}
          onChange={(e) =>
            setForm({
              ...form,
              type: e.target.value,
            })
          }
          className="rounded-2xl border px-5 py-4 text-black"
        >
          <option value="vilog">Vilog</option>
          <option value="payout">Payout</option>
          <option value="gifting">Gifting</option>
          <option value="limited-item">Limited Item</option>
        </select>

        <input
          type="number"
          placeholder="Harga"
          value={form.price}
          onChange={(e) =>
            setForm({
              ...form,
              price: e.target.value,
            })
          }
          className="rounded-2xl border px-5 py-4 text-black"
          required
        />

        <button className="rounded-2xl bg-black px-5 py-4 font-semibold text-white">
          Tambah
        </button>
      </form>

      <div className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Nama</th>
              <th className="p-4">Tipe</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.type}</td>
                <td className="p-4">
                  Rp {product.price.toLocaleString("id-ID")}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="rounded-xl bg-red-500 px-4 py-2 text-white"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
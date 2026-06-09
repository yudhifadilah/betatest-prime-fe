"use client";

import { useState } from "react";

type Staff = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff";
};

export default function StaffPage() {
  const [staffs, setStaffs] = useState<Staff[]>([
    {
      id: 1,
      name: "Admin",
      email: "admin@gmail.com",
      role: "admin",
    },
    {
      id: 2,
      name: "Staff 1",
      email: "staff@gmail.com",
      role: "staff",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
  });

  const addStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStaffs([
      ...staffs,
      {
        id: Date.now(),
        name: form.name,
        email: form.email,
        role: form.role as "admin" | "staff",
      },
    ]);

    setForm({
      name: "",
      email: "",
      role: "staff",
    });
  };

  const deleteStaff = (id: number) => {
    setStaffs(staffs.filter((staff) => staff.id !== id));
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-black">Manajemen Staff</h1>

      <form
        onSubmit={addStaff}
        className="mt-8 grid gap-4 rounded-[28px] bg-white p-6 shadow-sm md:grid-cols-4"
      >
        <input
          placeholder="Nama staff"
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

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          className="rounded-2xl border px-5 py-4 text-black"
          required
        />

        <select
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value,
            })
          }
          className="rounded-2xl border px-5 py-4 text-black"
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>

        <button className="rounded-2xl bg-black px-5 py-4 font-semibold text-white">
          Tambah Staff
        </button>
      </form>

      <div className="mt-8 rounded-[28px] bg-white p-6 shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-4">Nama</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {staffs.map((staff) => (
              <tr key={staff.id} className="border-b">
                <td className="p-4">{staff.name}</td>
                <td className="p-4">{staff.email}</td>
                <td className="p-4 capitalize">{staff.role}</td>
                <td className="p-4">
                  <button
                    onClick={() => deleteStaff(staff.id)}
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
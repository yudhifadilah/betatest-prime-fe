"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type AuthMode = "login" | "register";

type AuthModalContextType = {
  openAuthModal: (mode: AuthMode) => void;
};

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useAuthModal() {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error("useAuthModal must be used inside AuthModalProvider");
  }

  return context;
}

export default function AuthModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const openAuthModal = (selectedMode: AuthMode) => {
    setMode(selectedMode);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    localStorage.setItem("token", "dummy-token");

    closeAuthModal();
    window.location.reload();
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    alert("Register berhasil, silakan login.");
    setMode("login");
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}

      {mounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 px-5 backdrop-blur-md">
            <div className="w-full max-w-md rounded-[32px] bg-white p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-black">
                    {mode === "login" ? "Login" : "Register"}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {mode === "login"
                      ? "Masuk ke akun TopupStore"
                      : "Buat akun baru TopupStore"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAuthModal}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-black"
                >
                  <X size={22} />
                </button>
              </div>

              {mode === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({
                        ...loginForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({
                        ...loginForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
                    required
                  />

                  <button className="w-full rounded-2xl bg-black py-4 font-semibold text-white">
                    Login
                  </button>

                  <p className="text-center text-sm text-neutral-500">
                    Belum punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("register")}
                      className="font-semibold text-black"
                    >
                      Register
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nama"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
                    required
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
                    required
                  />

                  <input
                    type="password"
                    placeholder="Password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                    className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
                    required
                  />

                  <button className="w-full rounded-2xl bg-black py-4 font-semibold text-white">
                    Register
                  </button>

                  <p className="text-center text-sm text-neutral-500">
                    Sudah punya akun?{" "}
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="font-semibold text-black"
                    >
                      Login
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>,
          document.body
        )}
    </AuthModalContext.Provider>
  );
}
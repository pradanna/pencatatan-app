import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
// Kita tidak pakai GuestLayout agar bisa custom full background
import { Head, Link, useForm } from "@inertiajs/react";
import { LogIn } from "lucide-react"; // Pastikan install lucide-react atau hapus jika tidak mau icon

export default function Login({ status, canResetPassword }) {
    // --- LOGIKA BAWAAN (TIDAK BERUBAH) ---
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    // URL Gambar Background (Ganti sesuai selera)
    const bgImage = "/images/bg-login.png";

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-900">
            <Head title="Log in" />

            {/* --- 1. BACKGROUND IMAGE & OVERLAY --- */}
            <img
                src={bgImage}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover opacity-50 blur-[2px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 to-blue-900/40"></div>

            {/* --- 2. THE FLYING CARD --- */}
            <div className="relative z-10 w-full max-w-md p-6 animate-in fade-in zoom-in duration-300">
                <div className="bg-white/95 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-white/20 p-8">
                    {/* Header Login */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black text-gray-800">
                            Selamat Datang
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Masuk untuk mengelola keuangan Anda
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit}>
                        {/* Input Email */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email"
                                className="uppercase text-xs font-bold text-gray-500"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="contoh@email.com"
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Input Password */}
                        <div className="mt-5">
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="uppercase text-xs font-bold text-gray-500"
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Remember Me & Forgot Password */}
                        {/* Tombol Login (Yang sudah ada) */}
                        <div className="mt-8">
                            <PrimaryButton
                                className="w-full justify-center py-3 text-sm font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 rounded-xl"
                                disabled={processing}
                            >
                                {processing ? "Memproses..." : "Masuk Sekarang"}
                            </PrimaryButton>
                        </div>

                        {/* --- TAMBAHAN TOMBOL REGISTER --- */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500">
                                Belum punya akun?{" "}
                                <Link
                                    href={route("register")}
                                    className="text-blue-600 font-black hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4"
                                >
                                    Daftar Sekarang
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

                {/* Copyright Footer */}
                <div className="text-center mt-6 text-white/40 text-xs">
                    &copy; {new Date().getFullYear()} Aplikasi Keuangan by
                    Pradana Mahendra.
                </div>
            </div>
        </div>
    );
}

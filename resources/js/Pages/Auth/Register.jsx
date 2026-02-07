import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
// Hapus GuestLayout
import { Head, Link, useForm } from "@inertiajs/react";
import { UserPlus } from "lucide-react"; // Icon baru untuk Register

export default function Register() {
    // --- LOGIKA BAWAAN (TIDAK BERUBAH) ---
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    // Gunakan gambar yang sama dengan login agar konsisten
    const bgImage = "/images/bg-login.png";

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-900 py-10">
            <Head title="Register" />

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
                    {/* Header Register */}
                    <div className="text-center mb-8">
                        <div className="inline-flex p-3 bg-blue-50 rounded-full text-blue-600 mb-4 shadow-sm">
                            <UserPlus size={28} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800">
                            Buat Akun Baru
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Lengkapi data diri untuk bergabung
                        </p>
                    </div>

                    <form onSubmit={submit}>
                        {/* Input Name */}
                        <div>
                            <InputLabel
                                htmlFor="name"
                                value="Nama Lengkap"
                                className="uppercase text-xs font-bold text-gray-500"
                            />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
                                autoComplete="name"
                                isFocused={true}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                required
                                placeholder="Nama Anda"
                            />
                            <InputError
                                message={errors.name}
                                className="mt-2"
                            />
                        </div>

                        {/* Input Email */}
                        <div className="mt-4">
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
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                required
                                placeholder="contoh@email.com"
                            />
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Input Password */}
                        <div className="mt-4">
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
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                required
                                placeholder="Minimal 8 karakter"
                            />
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Input Confirm Password */}
                        <div className="mt-4">
                            <InputLabel
                                htmlFor="password_confirmation"
                                value="Konfirmasi Password"
                                className="uppercase text-xs font-bold text-gray-500"
                            />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 py-3"
                                autoComplete="new-password"
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value,
                                    )
                                }
                                required
                                placeholder="Ulangi password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-2"
                            />
                        </div>

                        {/* Tombol Register */}
                        <div className="mt-8">
                            <PrimaryButton
                                className="w-full justify-center py-3 text-sm font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl"
                                disabled={processing}
                            >
                                {processing
                                    ? "Mendaftarkan..."
                                    : "Daftar Sekarang"}
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* Link Balik ke Login */}
                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            Sudah punya akun?{" "}
                            <Link
                                href={route("login")}
                                className="text-blue-600 font-black hover:text-blue-800 transition-colors underline decoration-2 underline-offset-4"
                            >
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Copyright Footer */}
                <div className="text-center mt-6 text-white/40 text-xs">
                    &copy; {new Date().getFullYear()} Aplikasi Keuangan.
                </div>
            </div>
        </div>
    );
}

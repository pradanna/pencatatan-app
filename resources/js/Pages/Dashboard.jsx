import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import {
    Wallet,
    Landmark,
    Layers,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    AlertCircle,
    TrendingUp,
} from "lucide-react";

export default function Dashboard({ auth, rincian, health }) {
    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Dashboard Keuangan
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6 px-4 max-w-7xl mx-auto space-y-8">
                {/* --- BAGIAN 1: HEALTH CHECK (Indikator Utama) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Liquid Assets (Uang Tunai/Bank) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-emerald-500 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-5">
                            <Wallet size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Liquid Assets
                            </p>
                            <h2 className="text-3xl font-black text-emerald-700">
                                {formatRupiah(health.liquid)}
                            </h2>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                <Wallet size={12} /> Total Saldo Semua Akun
                            </p>
                        </div>
                    </div>

                    {/* 2. Net Cash Position (Posisi Kas Bersih) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-l-blue-500 relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-5">
                            <Landmark size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Posisi Kas Bersih
                            </p>
                            <h2
                                className={`text-3xl font-black ${health.net_cash >= 0 ? "text-blue-700" : "text-red-600"}`}
                            >
                                {formatRupiah(health.net_cash)}
                            </h2>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                <TrendingUp size={12} /> (Akun + Piutang Aktif)
                                - Hutang Aktif
                            </p>
                        </div>
                    </div>

                    {/* 3. Global Condition (Kekayaan Bersih) */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute right-0 top-0 p-4 opacity-10">
                            <Layers size={100} color="white" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Kekayaan Global
                            </p>
                            <h2 className="text-3xl font-black text-white">
                                {formatRupiah(health.global)}
                            </h2>
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                <Layers size={12} /> Real + Estimasi + Stock
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <hr className="flex-1 border-gray-200 border-dashed" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Rincian Detail
                    </span>
                    <hr className="flex-1 border-gray-200 border-dashed" />
                </div>

                {/* --- BAGIAN 2: RINCIAN 3 KOLOM --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* KOLOM 1: RINCIAN AKUN */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
                            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
                                <Wallet size={18} /> Saldo Akun
                            </h3>
                            <span className="text-[10px] font-black bg-white px-2 py-1 rounded text-emerald-600 border border-emerald-100">
                                REAL
                            </span>
                        </div>
                        <div className="p-4 space-y-3">
                            {rincian.daftar_akun.map((akun) => (
                                <div
                                    key={akun.id}
                                    className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                        <span className="text-sm font-medium text-gray-600">
                                            {akun.nama}
                                        </span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">
                                        {formatRupiah(akun.saldo)}
                                    </span>
                                </div>
                            ))}
                            {rincian.daftar_akun.length === 0 && (
                                <p className="text-xs text-center text-gray-400 italic">
                                    Belum ada akun terdaftar
                                </p>
                            )}
                        </div>
                        <div className="bg-emerald-50/50 p-3 text-center border-t border-emerald-100">
                            <p className="text-xs text-emerald-600 font-bold">
                                Total Liquid: {formatRupiah(health.liquid)}
                            </p>
                        </div>
                    </div>

                    {/* KOLOM 2: KEWAJIBAN (HUTANG) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
                            <h3 className="font-bold text-red-800 flex items-center gap-2">
                                <ArrowUpRight size={18} /> Kewajiban
                            </h3>
                            <span className="text-[10px] font-black bg-white px-2 py-1 rounded text-red-600 border border-red-100">
                                HUTANG
                            </span>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Hutang Aktif */}
                            <div className="flex justify-between items-center group">
                                <div>
                                    <p className="text-sm font-bold text-gray-700 group-hover:text-red-600 transition">
                                        Hutang Aktif
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        Tagihan Open (Jatuh Tempo)
                                    </p>
                                </div>
                                <span className="text-sm font-black text-red-600">
                                    {formatRupiah(rincian.hutang.aktif)}
                                </span>
                            </div>

                            {/* Hutang Estimasi */}
                            <div className="flex justify-between items-center group">
                                <div>
                                    <p className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition">
                                        Hutang Estimasi
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        Proyeksi / Belum Deal
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-orange-500 border-b border-orange-200 border-dashed">
                                    {formatRupiah(rincian.hutang.estimasi)}
                                </span>
                            </div>

                            <div className="pt-3 border-t mt-2 flex justify-between items-center bg-red-50 p-3 rounded-lg">
                                <span className="text-xs font-bold uppercase text-red-800">
                                    Total Kewajiban
                                </span>
                                <span className="text-base font-black text-red-700">
                                    {formatRupiah(rincian.hutang.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* KOLOM 3: ASET POTENSIAL (PIUTANG + STOCK) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
                            <h3 className="font-bold text-blue-800 flex items-center gap-2">
                                <ArrowDownRight size={18} /> Aset Potensial
                            </h3>
                            <span className="text-[10px] font-black bg-white px-2 py-1 rounded text-blue-600 border border-blue-100">
                                PIUTANG & STOCK
                            </span>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Piutang Aktif */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">
                                        Piutang Aktif
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        Tagihan Open (Uang di Luar)
                                    </p>
                                </div>
                                <span className="text-sm font-black text-blue-600">
                                    {formatRupiah(rincian.piutang.aktif)}
                                </span>
                            </div>

                            {/* Piutang Estimasi */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-gray-700">
                                        Piutang Estimasi
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        Project RAB / Penawaran
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-gray-500 border-b border-gray-200 border-dashed">
                                    {formatRupiah(rincian.piutang.estimasi)}
                                </span>
                            </div>

                            {/* Stock Barang */}
                            <div className="relative pt-4 mt-2">
                                <div className="absolute top-0 left-0 right-0 border-t border-dashed border-gray-200"></div>
                                <div className="flex justify-between items-center pt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-indigo-50 rounded text-indigo-500">
                                            <Package size={14} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">
                                                Stok Barang
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                Estimasi Nilai Jual
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-black text-indigo-600">
                                        {formatRupiah(rincian.stock)}
                                    </span>
                                </div>
                            </div>

                            <div className="pt-3 border-t mt-2 flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                                <span className="text-xs font-bold uppercase text-blue-800">
                                    Total Potensial
                                </span>
                                <span className="text-base font-black text-blue-700">
                                    {formatRupiah(
                                        rincian.piutang.total + rincian.stock,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

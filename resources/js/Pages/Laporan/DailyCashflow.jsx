import React from "react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import {
    Calendar,
    ArrowDownCircle,
    ArrowUpCircle,
    Wallet,
    History,
    Search,
} from "lucide-react";

export default function DailyCashflow({ auth, reports, filters, stats }) {
    const [filterData, setFilterData] = useState({
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
    });

    const handleSearch = () => {
        router.get(route("daily-cashflow.index"), filterData, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        const today = new Date().toISOString().split("T")[0];
        const firstDay = new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
        )
            .toISOString()
            .split("T")[0];

        setFilterData({ startDate: firstDay, endDate: today });
        router.get(route("daily-cashflow.index"), {
            startDate: firstDay,
            endDate: today,
        });
    };

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
                <h2 className="font-bold text-2xl text-gray-800">
                    Arus Kas Harian
                </h2>
            }
        >
            <Head title="Daily Cashflow" />

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-end gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
                        Dari Tanggal
                    </label>
                    <input
                        type="date"
                        value={filterData.startDate}
                        onChange={(e) =>
                            setFilterData({
                                ...filterData,
                                startDate: e.target.value,
                            })
                        }
                        className="block w-full border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">
                        Sampai Tanggal
                    </label>
                    <input
                        type="date"
                        value={filterData.endDate}
                        onChange={(e) =>
                            setFilterData({
                                ...filterData,
                                endDate: e.target.value,
                            })
                        }
                        className="block w-full border-gray-200 rounded-xl text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSearch}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm shadow-emerald-100 transition-all flex items-center gap-2"
                    >
                        <Search size={16} /> Cari Data
                    </button>
                    <button
                        onClick={handleReset}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
                    >
                        Reset
                    </button>
                </div>
            </div>

            {/* Ringkasan Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatCard
                    title="Saldo Awal"
                    value={stats.saldoAwal}
                    color="text-gray-600"
                    icon={<History size={20} />}
                />
                <StatCard
                    title="Pemasukan (Periode)"
                    value={stats.totalPemasukan}
                    color="text-green-600"
                    icon={<ArrowDownCircle size={20} />}
                />
                <StatCard
                    title="Pengeluaran (Periode)"
                    value={stats.totalPengeluaran}
                    color="text-red-600"
                    icon={<ArrowUpCircle size={20} />}
                />
                <StatCard
                    title="Saldo Akhir"
                    value={stats.saldoAkhir}
                    color="text-blue-600"
                    icon={<Wallet size={20} />}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <th className="px-6 py-4 text-left">Tanggal</th>
                            <th className="px-6 py-4 text-right">Pemasukan</th>
                            <th className="px-6 py-4 text-right">
                                Pengeluaran
                            </th>
                            <th className="px-6 py-4 text-right">
                                Hutang Baru
                            </th>
                            <th className="px-6 py-4 text-right">
                                Piutang Baru
                            </th>
                            <th className="px-6 py-4 text-right bg-blue-50/50 text-blue-600">
                                Saldo Akhir
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {reports.map((row, i) => (
                            <tr
                                key={i}
                                className="hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <Calendar
                                            size={14}
                                            className="text-gray-400"
                                        />
                                        {row.tanggal}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-bold text-green-600">
                                    {row.pemasukan > 0
                                        ? `+${formatRupiah(row.pemasukan)}`
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-bold text-red-600">
                                    {row.pengeluaran > 0
                                        ? `-${formatRupiah(row.pengeluaran)}`
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-purple-600">
                                    {row.hutang > 0
                                        ? formatRupiah(row.hutang)
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-orange-600">
                                    {row.piutang > 0
                                        ? formatRupiah(row.piutang)
                                        : "-"}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-black bg-blue-50/30 text-blue-700">
                                    {formatRupiah(row.saldo_akhir)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, color, icon }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                    {icon}
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    {title}
                </span>
            </div>
            <p className={`text-lg font-black ${color}`}>
                {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(value)}
            </p>
        </div>
    );
}

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LaporanPengeluaran({
    auth,
    pengeluarans,
    chartData,
    suppliers,
    categories,
    filters,
    stats,
}) {
    console.log("Cek Data stats:", stats);

    const [filterData, setFilterData] = useState({
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
        status: filters.status || "",
        contact_id: filters.contact_id || "",
        category_id: filters.category_id || "",
    });

    useEffect(() => {
        setFilterData({
            startDate: filters.startDate || "",
            endDate: filters.endDate || "",
            status: filters.status || "",
            contact_id: filters.contact_id || "",
            category_id: filters.category_id || "",
        });
    }, [filters]);

    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    const handleFilter = () => {
        router.get(route("laporan-pengeluaran.index"), filterData, {
            preserveState: true,
        });
    };

    const dataChart = {
        labels: chartData.map((d) => d.nama),
        datasets: [
            {
                data: chartData.map((d) => d.total),
                backgroundColor: [
                    "#ef4444",
                    "#f59e0b",
                    "#3b82f6",
                    "#10b981",
                    "#8b5cf6",
                ],
            },
        ],
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl">Laporan Pengeluaran</h2>}
        >
            <Head title="Laporan Pengeluaran" />

            <div className="py-6 px-4 space-y-6">
                {/* Filter Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                            Periode
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filterData.startDate}
                                onChange={(e) =>
                                    setFilterData({
                                        ...filterData,
                                        startDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border-gray-200 text-sm"
                            />
                            <input
                                type="date"
                                value={filterData.endDate}
                                onChange={(e) =>
                                    setFilterData({
                                        ...filterData,
                                        endDate: e.target.value,
                                    })
                                }
                                className="rounded-lg border-gray-200 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                            Supplier
                        </label>
                        <select
                            value={filterData.contact_id}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    contact_id: e.target.value,
                                })
                            }
                            className="rounded-lg border-gray-200 text-sm min-w-[150px]"
                        >
                            <option value="">Semua Supplier</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                            Kategori
                        </label>
                        <select
                            value={filterData.category_id}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    category_id: e.target.value,
                                })
                            }
                            className="rounded-lg border-gray-200 text-sm min-w-[150px]"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleFilter}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-sm"
                    >
                        Cari
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-6">
                            Alokasi Biaya
                        </h3>
                        <div className="w-full max-w-[220px]">
                            <Pie
                                data={dataChart}
                                options={{
                                    plugins: {
                                        legend: { position: "bottom" },
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                Total Pengeluaran
                            </span>
                            <p className="text-2xl font-black text-red-600">
                                {formatRupiah(stats.totalPengeluaran)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                Sudah Dibayar
                            </span>
                            <p className="text-2xl font-black text-emerald-600">
                                {formatRupiah(stats.totalLunas)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                Total Hutang
                            </span>
                            <p className="text-2xl font-black text-orange-600">
                                {formatRupiah(stats.totalHutang)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart and Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr className="text-[10px] font-black text-gray-400 uppercase">
                                <th className="px-6 py-4 text-left">
                                    Tanggal / Supplier
                                </th>
                                <th className="px-6 py-4 text-left">
                                    Kategori
                                </th>
                                <th className="px-6 py-4 text-left">
                                    supplier
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Nominal
                                </th>
                                <th className="px-6 py-4 text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pengeluarans.map((item) => {
                                const isHutang =
                                    item.hutang_piutang_id !== null;

                                return (
                                    <tr key={item.id} className="text-sm">
                                        <td className="px-6 py-4">
                                            <div className="font-bold">
                                                {item.tanggal}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {item.contact?.name || "Umum"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.category?.nama}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.contact?.nama}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold">
                                            {formatRupiah(item.nominal)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {isHutang ? (
                                                <span className="px-2 py-1 rounded text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                                                    HUTANG
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
                                                    LUNAS
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

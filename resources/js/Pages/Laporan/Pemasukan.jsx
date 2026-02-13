import React, { useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function LaporanPemasukan({
    auth,
    pemasukans,
    chartData,
    contacts,
    categories,
    filters,
    stats,
}) {
    console.log("Cek Data Contacts:", contacts);

    const [filterData, setFilterData] = React.useState({
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
        });
    }, [filters]);
    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    const dataChart = {
        labels: chartData.map((d) => d.nama),
        datasets: [
            {
                data: chartData.map((d) => d.total),
                backgroundColor: [
                    "#10b981",
                    "#3b82f6",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                ],
            },
        ],
    };

    const handleFilter = () => {
        router.get(route("laporan-pemasukan.index"), filterData, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-bold text-xl">Laporan Pemasukan</h2>}
        >
            <Head title="Laporan Pemasukan" />

            <div className="py-6 px-4 space-y-6">
                {/* 1. Filter Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6 flex flex-wrap gap-4 items-end">
                    {/* Filter Tanggal */}
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

                    {/* Filter Customer */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                            Customer
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
                            <option value="">Semua Customer</option>
                            {/* Gunakan contacts_in atau contacts sesuai kiriman Controller */}
                            {contacts?.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name || c.nama}{" "}
                                    {/* Coba dua-duanya jika ragu nama kolomnya */}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Kategori */}
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
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Status */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">
                            Status
                        </label>
                        <select
                            value={filterData.status}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    status: e.target.value,
                                })
                            }
                            className="rounded-lg border-gray-200 text-sm"
                        >
                            <option value="">Semua Status</option>
                            <option value="LUNAS">LUNAS</option>
                            <option value="PENDING">PENDING</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleFilter}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                        >
                            Cari
                        </button>
                        <button
                            onClick={() => {
                                router.get(route("laporan-pemasukan.index")); // Reset ke default
                            }}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* 2. Stats & Grafik */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border flex flex-col items-center">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">
                            Proporsi Kategori
                        </h3>
                        <div className="w-full max-w-[250px]">
                            <Pie
                                data={dataChart}
                                options={{
                                    plugins: { legend: { position: "bottom" } },
                                }}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <span className="text-xs font-bold text-emerald-600 uppercase">
                                Total Pemasukan (Gross)
                            </span>
                            <p className="text-2xl font-black text-emerald-700">
                                {formatRupiah(stats.totalNominal)}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                Total Modal
                            </span>
                            <p className="text-xl font-black text-red-600">
                                {formatRupiah(stats.totalModal)}
                            </p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-600 uppercase">
                                Total Lunas (Cash)
                            </span>
                            <p className="text-2xl font-black text-blue-700">
                                {formatRupiah(stats.totalLunas)}
                            </p>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                            <span className="text-xs font-bold text-orange-600 uppercase">
                                Total Pending (Piutang)
                            </span>
                            <p className="text-2xl font-black text-orange-700">
                                {formatRupiah(stats.totalPending)}
                            </p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase">
                                Estimasi Profit
                            </span>
                            <p className="text-xl font-black text-blue-600">
                                {formatRupiah(stats.totalProfit)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Tabel Detail */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr className="text-[10px] font-black text-gray-400 uppercase">
                                <th className="px-6 py-4 text-left">Tanggal</th>
                                <th className="px-6 py-4 text-left">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-left">
                                    Kategori
                                </th>
                                <th className="px-6 py-4 text-right">
                                    Nominal
                                </th>
                                <th className="px-6 py-4 text-right">Modal</th>
                                <th className="px-6 py-4 text-right">Profit</th>
                                <th className="px-6 py-4 text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pemasukans.map((item) => {
                                const modal = item.total_modal || 0;
                                const profit = item.nominal - modal;

                                return (
                                    console.log(item),
                                    (
                                        <tr key={item.id} className="text-sm">
                                            <td className="px-6 py-4 font-medium">
                                                {item.tanggal}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.contact?.nama || "-"}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.category?.nama}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold">
                                                {formatRupiah(item.nominal)}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-red-500">
                                                {formatRupiah(modal)}
                                            </td>
                                            <td
                                                className={`px-6 py-4 text-right text-sm font-black ${profit >= 0 ? "text-blue-600" : "text-pink-600"}`}
                                            >
                                                {formatRupiah(profit)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span
                                                    className={`px-2 py-1 rounded-md text-[10px] font-bold ${item.status === "LUNAS" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

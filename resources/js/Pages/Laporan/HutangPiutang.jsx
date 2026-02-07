import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Eye, FileSpreadsheet, Printer, X } from "lucide-react";

export default function LaporanHutangPiutang({
    auth,
    rekapPiutang,
    rekapHutang,
    totals,
}) {
    // State untuk Modal
    const [isOpen, setIsOpen] = useState(false);
    const [detailData, setDetailData] = useState({
        contact: null,
        transaksi: [],
        jenis: "",
    });
    const [loading, setLoading] = useState(false);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number);
    };

    const openDetail = async (contactId, jenis) => {
        setLoading(true);
        setIsOpen(true);
        setDetailData({ contact: null, transaksi: [], jenis: jenis }); // Reset dulu

        try {
            const response = await axios.get(
                route("laporan-hutang-piutang.detail", {
                    contact: contactId,
                    jenis: jenis,
                }),
            );
            setDetailData({
                contact: response.data.contact,
                transaksi: response.data.transaksi,
                jenis: jenis,
            });
        } catch (error) {
            console.error("Gagal mengambil data", error);
            alert("Terjadi kesalahan saat mengambil data.");
            setIsOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Laporan Hutang & Piutang
                </h2>
            }
        >
            <Head title="Laporan Hutang Piutang" />

            <div className="py-6 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Grid Layout: Kiri Piutang, Kanan Hutang */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* TABEL PIUTANG (Customer Hutang ke Kita) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-t-4 border-blue-500">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-700 mb-1 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                    Daftar Piutang
                                </h3>
                                <p className="text-xs text-gray-400 mb-6">
                                    Uang kita yang masih dibawa Customer
                                </p>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Nama Customer
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Total Nominal
                                                </th>
                                                <th className="px-4 py-3 text-center">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {rekapPiutang.length > 0 ? (
                                                rekapPiutang.map(
                                                    (item, index) => (
                                                        <tr
                                                            key={index}
                                                            className="bg-white hover:bg-blue-50 transition-colors"
                                                        >
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {item.contact
                                                                    ?.nama ||
                                                                    "Tanpa Nama"}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-blue-600">
                                                                {formatRupiah(
                                                                    item.total_hutang,
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() =>
                                                                        openDetail(
                                                                            item.contact_id,
                                                                            "PIUTANG",
                                                                        )
                                                                    }
                                                                    className="bg-blue-100 text-blue-600 p-1.5 rounded hover:bg-blue-200 transition"
                                                                    title="Lihat Detail"
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="2"
                                                        className="px-4 py-6 text-center text-gray-400 italic"
                                                    >
                                                        Tidak ada piutang
                                                        pending.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* TABEL HUTANG (Kita Hutang ke Supplier) */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border-t-4 border-orange-500">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-700 mb-1 flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                    Daftar Hutang
                                </h3>
                                <p className="text-xs text-gray-400 mb-6">
                                    Kewajiban kita membayar ke Supplier
                                </p>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3">
                                                    Nama Supplier
                                                </th>
                                                <th className="px-4 py-3 text-right">
                                                    Total Nominal
                                                </th>
                                                <th className="px-4 py-3 text-center">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {rekapHutang.length > 0 ? (
                                                rekapHutang.map(
                                                    (item, index) => (
                                                        <tr
                                                            key={index}
                                                            className="bg-white hover:bg-orange-50 transition-colors"
                                                        >
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {item.contact
                                                                    ?.nama ||
                                                                    "Tanpa Nama"}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-orange-600">
                                                                {formatRupiah(
                                                                    item.total_hutang,
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() =>
                                                                        openDetail(
                                                                            item.contact_id,
                                                                            "HUTANG",
                                                                        )
                                                                    }
                                                                    className="bg-orange-100 text-orange-600 p-1.5 rounded hover:bg-orange-200 transition"
                                                                    title="Lihat Detail"
                                                                >
                                                                    <Eye
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="2"
                                                        className="px-4 py-6 text-center text-gray-400 italic"
                                                    >
                                                        Tidak ada hutang
                                                        pending.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TOTAL SUMMARY SECTION */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">
                                Total Aset (Piutang)
                            </div>
                            <div className="text-2xl font-black text-blue-600">
                                {formatRupiah(totals.totalPiutang)}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="text-xs font-bold text-gray-400 uppercase mb-1">
                                Total Kewajiban (Hutang)
                            </div>
                            <div className="text-2xl font-black text-orange-600">
                                {formatRupiah(totals.totalHutang)}
                            </div>
                        </div>
                        {/* Hitung Selisih Bersih */}
                        <div
                            className={`p-6 rounded-xl shadow-sm border ${totals.totalPiutang - totals.totalHutang >= 0 ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}
                        >
                            <div className="text-xs font-bold text-gray-500 uppercase mb-1">
                                Selisih Bersih (Neraca)
                            </div>
                            <div
                                className={`text-2xl font-black ${totals.totalPiutang - totals.totalHutang >= 0 ? "text-emerald-700" : "text-red-700"}`}
                            >
                                {formatRupiah(
                                    totals.totalPiutang - totals.totalHutang,
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Header Modal */}
                        <div
                            className={`p-4 flex justify-between items-center text-white ${detailData.jenis === "PIUTANG" ? "bg-blue-600" : "bg-orange-600"}`}
                        >
                            <div>
                                <h3 className="font-bold text-lg">
                                    Rincian{" "}
                                    {detailData.jenis === "PIUTANG"
                                        ? "Piutang"
                                        : "Hutang"}
                                </h3>
                                <p className="text-xs opacity-90">
                                    {detailData.contact?.name || "Loading..."}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 p-1 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400">
                                    Memuat data transaksi...
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">
                                                Tanggal
                                            </th>
                                            <th className="px-4 py-2">
                                                Keterangan
                                            </th>
                                            <th className="px-4 py-2 text-right">
                                                Nominal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {detailData.transaksi.map((t, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    {t.tanggal}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {t.keterangan}
                                                </td>
                                                <td className="px-4 py-2 text-right font-bold">
                                                    {formatRupiah(t.nominal)}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50">
                                            <td
                                                colSpan="2"
                                                className="px-4 py-2 font-bold text-right"
                                            >
                                                TOTAL
                                            </td>
                                            <td className="px-4 py-2 text-right font-black text-base">
                                                {formatRupiah(
                                                    detailData.transaksi.reduce(
                                                        (acc, curr) =>
                                                            acc + curr.nominal,
                                                        0,
                                                    ),
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer Modal (Tombol Export) */}
                        {!loading && detailData.contact && (
                            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                                {/* Tombol Excel */}
                                <a
                                    href={route(
                                        "laporan-hutang-piutang.export",
                                        {
                                            contact: detailData.contact.id,
                                            jenis: detailData.jenis,
                                            format: "excel",
                                        },
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition"
                                >
                                    <FileSpreadsheet size={16} /> Excel
                                </a>

                                {/* Tombol PDF */}
                                <a
                                    href={route(
                                        "laporan-hutang-piutang.export",
                                        {
                                            contact: detailData.contact.id,
                                            jenis: detailData.jenis,
                                            format: "pdf",
                                        },
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                                >
                                    <Printer size={16} /> Download PDF
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

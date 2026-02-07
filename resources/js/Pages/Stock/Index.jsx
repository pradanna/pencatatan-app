import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import {
    Pencil,
    Trash2,
    Plus,
    Search,
    Package,
    TrendingUp,
    AlertCircle,
    FolderInput,
    FolderOutput,
    History as HistoryIcon,
} from "lucide-react";

export default function StockIndex({
    auth,
    stocks,
    totalAset,
    akuns,
    histories,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [isStockOutModalOpen, setIsStockOutModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);

    // STOCKS IN
    const {
        data: stockInData,
        setData: setStockInData,
        post: postStockIn,
        processing: stockInProcessing,
        reset: resetStockIn,
    } = useForm({
        qty_masuk: 1,
    });

    const openStockInModal = (item) => {
        setSelectedStock(item);
        setIsStockInModalOpen(true);
    };

    // STOCKS OUT
    const {
        data: stockOutData,
        setData: setStockOutData,
        post: postStockOut,
        processing: stockOutProcessing,
        reset: resetStockOut,
    } = useForm({
        qty_keluar: 1,
        akun_id: akuns[0]?.id || "", // Default ke akun pertama
    });

    const openStockOutModal = (item) => {
        setSelectedStock(item);
        setIsStockOutModalOpen(true);
    };

    // Form Helper
    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        errors,
        reset,
    } = useForm({
        id: "",
        nama_barang: "",
        qty: 0,
        satuan: "Pcs",
        harga_modal_avg: 0,
        harga_jual_default: 0,
    });

    const openModal = (item = null) => {
        if (item) {
            setIsEditMode(true);
            setData({
                id: item.id,
                nama_barang: item.nama_barang,
                qty: item.qty,
                satuan: item.satuan,
                harga_modal_avg: item.harga_modal_avg, // Harga Beli
                harga_jual_default: item.harga_jual_default, // Harga Jual
            });
        } else {
            setIsEditMode(false);
            reset();
            setData("satuan", "Pcs"); // Default satuan
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const submit = (e) => {
        e.preventDefault();
        isEditMode
            ? put(route("stocks.update", data.id), { onSuccess: closeModal })
            : post(route("stocks.store"), { onSuccess: closeModal });
    };

    const deleteStock = (id) => {
        if (confirm("Hapus produk ini?")) destroy(route("stocks.destroy", id));
    };

    const filteredStocks = stocks.filter((item) =>
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()),
    );

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
                <div>
                    <h2 className="font-bold text-2xl text-gray-800">
                        Katalog Produk & Aset
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Daftar barang dagangan dan aset inventaris.
                    </p>
                </div>
            }
        >
            <Head title="Katalog Produk" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">
                            Total Nilai Aset
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {formatRupiah(totalAset)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">
                            Total Jenis Produk
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {stocks.length}{" "}
                            <span className="text-sm font-normal text-gray-400 italic">
                                Item
                            </span>
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">
                            Stok Menipis
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {
                                stocks.filter((s) => s.qty < 500 && s.qty > 0)
                                    .length
                            }
                            <span className="text-sm font-normal text-gray-400 italic">
                                {" "}
                                Item
                            </span>
                        </h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>

                        <input
                            type="text"
                            placeholder="Cari nama barang..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm shadow-primary-200"
                    >
                        <Plus size={16} />
                        Tambah Produk
                    </button>
                </div>

                {/* Tabel */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Nama Barang
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Stok
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Harga Modal
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Harga Jual
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredStocks.length > 0 ? (
                                filteredStocks.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                                    <Package size={18} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {item.nama_barang}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.satuan}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {/* Logic Badge Stok */}
                                            <div
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                            ${
                                                item.qty <= 0
                                                    ? "bg-red-100 text-red-800"
                                                    : item.qty < 500
                                                      ? "bg-yellow-100 text-yellow-800"
                                                      : "bg-green-100 text-green-800"
                                            }`}
                                            >
                                                {item.qty <= 0 && (
                                                    <AlertCircle
                                                        size={12}
                                                        className="mr-1"
                                                    />
                                                )}
                                                {item.qty} {item.satuan}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatRupiah(item.harga_modal_avg)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                            {formatRupiah(
                                                item.harga_jual_default,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openStockInModal(item)
                                                    }
                                                    className="p-1.5 rounded-md text-green-600 hover:bg-green-50 border border-transparent hover:border-green-200 transition-all ml-1"
                                                    title="Stok Masuk"
                                                >
                                                    <FolderInput size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openStockOutModal(item)
                                                    }
                                                    className="p-1.5 rounded-md text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all ml-2"
                                                    title="Stok Keluar"
                                                >
                                                    <FolderOutput size={16} />
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        openModal(item)
                                                    }
                                                    className="p-1.5 rounded-md text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-all"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteStock(item.id)
                                                    }
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        Belum ada produk
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <HistoryIcon size={18} className="text-primary-500" />
                        Riwayat Aktivitas Stok
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">
                                    Waktu
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">
                                    Barang
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">
                                    Tipe
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">
                                    Jumlah
                                </th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">
                                    Ket
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {histories.map((h) => (
                                <tr key={h.id} className="text-sm">
                                    <td className="px-6 py-3 text-gray-500 text-xs">
                                        {new Date(h.created_at).toLocaleString(
                                            "id-ID",
                                        )}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-gray-900">
                                        {h.stock.nama_barang}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span
                                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.type === "IN" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                        >
                                            {h.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-bold">
                                        {h.type === "IN" ? "+" : "-"}
                                        {h.qty}
                                    </td>
                                    <td className="px-6 py-3 text-gray-500 text-xs">
                                        {h.keterangan}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* MODAL FORM */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">
                        {isEditMode ? "Edit Produk" : "Tambah Produk Baru"}
                    </h2>

                    {/* Nama Barang */}
                    <div className="mb-4">
                        <InputLabel
                            htmlFor="nama_barang"
                            value="Nama Barang / Aset"
                        />
                        <TextInput
                            id="nama_barang"
                            value={data.nama_barang}
                            onChange={(e) =>
                                setData("nama_barang", e.target.value)
                            }
                            className="mt-1 block w-full rounded-lg"
                            isFocused
                            placeholder="Contoh: Kertas A4, Laptop Asus, dll"
                        />
                        <InputError
                            message={errors.nama_barang}
                            className="mt-2"
                        />
                    </div>

                    {/* Qty & Satuan */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="qty" value="Stok Saat Ini" />
                            <TextInput
                                id="qty"
                                type="number"
                                value={data.qty}
                                onChange={(e) => setData("qty", e.target.value)}
                                className="mt-1 block w-full rounded-lg"
                            />
                            <InputError message={errors.qty} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="satuan" value="Satuan Unit" />
                            <TextInput
                                id="satuan"
                                value={data.satuan}
                                onChange={(e) =>
                                    setData("satuan", e.target.value)
                                }
                                className="mt-1 block w-full rounded-lg"
                                placeholder="Pcs, Rim, Kg..."
                            />
                        </div>
                    </div>

                    {/* Harga Modal & Jual */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <InputLabel
                                htmlFor="harga_modal"
                                value="Harga Beli (Modal)"
                            />
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">
                                    Rp
                                </span>
                                <TextInput
                                    id="harga_modal"
                                    type="number"
                                    value={data.harga_modal_avg}
                                    onChange={(e) =>
                                        setData(
                                            "harga_modal_avg",
                                            e.target.value,
                                        )
                                    }
                                    className="block w-full pl-9 rounded-lg"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Estimasi modal per unit
                            </p>
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="harga_jual"
                                value="Harga Jual"
                            />
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-2 text-gray-500 text-sm">
                                    Rp
                                </span>
                                <TextInput
                                    id="harga_jual"
                                    type="number"
                                    value={data.harga_jual_default}
                                    onChange={(e) =>
                                        setData(
                                            "harga_jual_default",
                                            e.target.value,
                                        )
                                    }
                                    className="block w-full pl-9 rounded-lg border-primary-200 focus:border-primary-500 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            className="bg-primary-600 hover:bg-primary-700"
                            disabled={processing}
                        >
                            {processing ? "Menyimpan..." : "Simpan Produk"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal
                show={isStockOutModalOpen}
                onClose={() => setIsStockOutModalOpen(false)}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        postStockOut(
                            route("stocks.stockOut", selectedStock.id),
                            {
                                onSuccess: () => {
                                    setIsStockOutModalOpen(false);
                                    resetStockOut();
                                },
                            },
                        );
                    }}
                    className="p-6"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                        Stok Keluar: {selectedStock?.nama_barang}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        Stok saat ini: {selectedStock?.qty}{" "}
                        {selectedStock?.satuan}
                    </p>

                    <div className="mb-4">
                        <InputLabel value="Jumlah Keluar" />
                        <TextInput
                            type="number"
                            className="mt-1 block w-full"
                            value={stockOutData.qty_keluar}
                            onChange={(e) =>
                                setStockOutData("qty_keluar", e.target.value)
                            }
                            max={selectedStock?.qty}
                        />
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Uang Masuk Ke" />
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500"
                            value={stockOutData.akun_id}
                            onChange={(e) =>
                                setStockOutData("akun_id", e.target.value)
                            }
                        >
                            {akuns.map((akun) => (
                                <option key={akun.id} value={akun.id}>
                                    {akun.nama} (Saldo: {akun.saldo})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-primary-50 p-4 rounded-lg mb-6">
                        <div className="flex justify-between text-sm text-primary-800 font-bold">
                            <span>Total Pemasukan:</span>
                            <span>
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                }).format(
                                    stockOutData.qty_keluar *
                                        (selectedStock?.harga_jual_default ||
                                            0),
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton
                            onClick={() => setIsStockOutModalOpen(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={stockOutProcessing}>
                            Proses Keluar
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
            <Modal
                show={isStockInModalOpen}
                onClose={() => setIsStockInModalOpen(false)}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        postStockIn(route("stocks.stockIn", selectedStock.id), {
                            onSuccess: () => {
                                setIsStockInModalOpen(false);
                                resetStockIn();
                            },
                        });
                    }}
                    className="p-6"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                        Stok Masuk: {selectedStock?.nama_barang}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        Stok saat ini: {selectedStock?.qty}{" "}
                        {selectedStock?.satuan}
                    </p>

                    <div className="mb-6">
                        <InputLabel value="Jumlah Stok Masuk" />
                        <TextInput
                            type="number"
                            className="mt-1 block w-full rounded-lg"
                            value={stockInData.qty_masuk}
                            onChange={(e) =>
                                setStockInData("qty_masuk", e.target.value)
                            }
                            min="1"
                        />
                        <p className="text-[11px] text-gray-400 mt-2">
                            *Penambahan stok ini tidak akan mengurangi saldo
                            akun manapun.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton
                            onClick={() => setIsStockInModalOpen(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            className="bg-green-600 hover:bg-green-700"
                            disabled={stockInProcessing}
                        >
                            {stockInProcessing ? "Memproses..." : "Tambah Stok"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

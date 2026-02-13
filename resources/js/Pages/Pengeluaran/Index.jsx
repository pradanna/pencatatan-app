import React, { useState, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { router } from "@inertiajs/react";
import {
    Plus,
    Trash2,
    ArrowUpCircle,
    Utensils,
    Coffee,
    Printer,
    Briefcase,
    Wallet,
} from "lucide-react";
import InputError from "@/Components/InputError";

export default function PengeluaranIndex({
    auth,
    pengeluarans,
    akuns,
    categories,
    suppliers,
    pemasukans,
    supplierItems,
    filters,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filteredItems, setFilteredItems] = useState([]);

    const [qty, setQty] = useState(1);
    const [hargaSatuan, setHargaSatuan] = useState(0);

    // State untuk filter
    const [filterData, setFilterData] = useState({
        from_date: filters.from_date || "",
        to_date: filters.to_date || "",
        status: filters.status || "",
        contact_id: filters.contact_id || "",
        akun_id: filters.akun_id || "",
    });

    const handleFilter = () => {
        router.get(route("pengeluarans.index"), filterData, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const isMounted = useRef(false);
    useEffect(() => {
        if (isMounted.current) {
            handleFilter();
        } else {
            isMounted.current = true;
        }
    }, [filterData]);

    const { data, setData, post, processing, errors, reset } = useForm({
        akun_id: akuns[0]?.id || "",
        category_id: "",
        contact_id: "",
        pemasukan_ref_id: "",
        supplier_item_id: "",
        nominal: "",
        tanggal: new Date().toISOString().split("T")[0],
        keterangan: "",
        status: "LUNAS",
    });

    // Logika Auto-filter Barang berdasarkan Supplier
    const handleSupplierChange = (id) => {
        setData("contact_id", id);
        setFilteredItems(supplierItems.filter((item) => item.contact_id == id));
    };

    const submit = (e) => {
        e.preventDefault();

        console.log("Data yang dikirim:", data);

        post(route("pengeluarans.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const handleItemChange = (id) => {
        setData("supplier_item_id", id);
        const item = supplierItems.find((i) => i.id == id);
        if (item) {
            setHargaSatuan(item.harga_satuan); // Isi harga satuan dari katalog
            setData("keterangan", `Beli ${item.nama_barang}`);
        }
    };

    useEffect(() => {
        const total = qty * hargaSatuan;
        setData("nominal", total);
    }, [qty, hargaSatuan]);

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
                    Catatan Pengeluaran
                </h2>
            }
        >
            <Head title="Pengeluaran" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <ArrowUpCircle className="text-red-500" size={20} />{" "}
                        Riwayat Pengeluaran
                    </h3>
                    <PrimaryButton
                        onClick={() => setIsModalOpen(true)}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Plus size={16} className="mr-2" /> Catat Pengeluaran
                    </PrimaryButton>
                </div>

                <div className="flex flex-wrap items-end gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <label className="block text-xs font-medium text-gray-700">
                            Dari Tanggal
                        </label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                            value={filters.from_date}
                            onChange={(e) =>
                                setFilterData({
                                    ...filters,
                                    from_date: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700">
                            Sampai Tanggal
                        </label>
                        <input
                            type="date"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                            value={filters.to_date}
                            onChange={(e) =>
                                setFilterData({
                                    ...filters,
                                    to_date: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Filter Supplier */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700">
                            Supplier
                        </label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                            value={filterData.contact_id}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    contact_id: e.target.value,
                                })
                            }
                        >
                            <option value="">Semua Supplier</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Akun */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700">
                            Akun
                        </label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                            value={filterData.akun_id}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    akun_id: e.target.value,
                                })
                            }
                        >
                            <option value="">Semua Akun</option>
                            {akuns.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700">
                            Status
                        </label>
                        <select
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm"
                            value={filters.status}
                            onChange={(e) =>
                                setFilterData({
                                    ...filters,
                                    status: e.target.value,
                                })
                            }
                        >
                            <option value="">Semua Status</option>
                            <option value="LUNAS">LUNAS</option>
                            <option value="HUTANG">HUTANG</option>
                        </select>
                    </div>
                    <button
                        onClick={() => {
                            const today = new Date()
                                .toISOString()
                                .split("T")[0];
                            setFilterData({
                                from_date: today,
                                to_date: today,
                                status: "",
                                contact_id: "",
                                akun_id: "",
                            });
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
                    >
                        Reset
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50 text-[11px] font-bold text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    Tanggal / Akun
                                </th>
                                <th className="px-6 py-4 text-left">
                                    Keterangan & Kategori
                                </th>
                                <th className="px-6 py-4 text-left">
                                    Relasi Proyek
                                </th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Nominal</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {pengeluarans.length > 0 ? (
                                pengeluarans.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/50 transition-colors group"
                                    >
                                        {/* 1. TANGGAL & AKUN */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-gray-900 font-medium">
                                                {item.tanggal}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight flex items-center gap-1">
                                                <Wallet size={10} />{" "}
                                                {item.akun?.nama ||
                                                    "Akun Terhapus"}
                                            </div>
                                        </td>

                                        {/* 2. KETERANGAN & KATEGORI */}
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">
                                                {item.keterangan}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                {/* Tampilan Kategori */}
                                                <span className="text-[10px] bg-dark-100 text-dark-600 px-2 py-0.5 rounded border border-dark-200 font-bold uppercase">
                                                    {item.category?.nama ||
                                                        "Tanpa Kategori"}
                                                </span>
                                                {/* Tampilan Supplier (Jika ada) */}
                                                {item.contact && (
                                                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100 font-bold">
                                                        🚛 {item.contact.nama}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 3. RELASI PROYEK (PEMASUKAN) */}
                                        <td className="px-6 py-4">
                                            {item.pemasukan ? (
                                                <div className="bg-primary-50 border border-primary-100 p-2 rounded-lg">
                                                    <div className="text-[10px] text-primary-600 font-bold uppercase tracking-widest leading-none mb-1">
                                                        Modal Proyek
                                                    </div>
                                                    <div className="text-xs font-bold text-gray-800 truncate max-w-[150px]">
                                                        {
                                                            item.pemasukan
                                                                .keterangan
                                                        }
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-300 italic">
                                                    Pengeluaran Umum
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.hutang_piutang_id ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black border bg-orange-50 text-orange-700 border-orange-200 animate-pulse">
                                                    HUTANG
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black border bg-green-50 text-green-700 border-green-200">
                                                    LUNAS
                                                </span>
                                            )}
                                        </td>

                                        {/* 4. NOMINAL */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-right font-black text-red-600">
                                                {formatRupiah(item.nominal)}
                                            </div>
                                        </td>

                                        {/* 5. AKSI */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() =>
                                                    confirm(
                                                        "Hapus data ini? Saldo akun akan dikembalikan.",
                                                    ) &&
                                                    router.delete(
                                                        route(
                                                            "pengeluarans.destroy",
                                                            item.id,
                                                        ),
                                                    )
                                                }
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="px-6 py-10 text-center text-gray-400 italic"
                                    >
                                        Belum ada data pengeluaran.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL INPUT PENGELUARAN */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold mb-6 border-b pb-3 text-red-600">
                        Catat Pengeluaran Baru
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Tanggal" />
                            <TextInput
                                type="date"
                                className="w-full mt-1"
                                value={data.tanggal}
                                onChange={(e) =>
                                    setData("tanggal", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <InputLabel value="Hubungkan ke Proyek (Pemasukan)" />
                            <select
                                className="w-full border-gray-300 rounded-lg mt-1 bg-blue-50"
                                value={data.pemasukan_ref_id}
                                onChange={(e) =>
                                    setData("pemasukan_ref_id", e.target.value)
                                }
                            >
                                <option value="">
                                    -- Umum / Bukan Modal Proyek --
                                </option>
                                {pemasukans.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.keterangan} (
                                        {formatRupiah(p.nominal)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mb-4">
                        <InputLabel value="Status Pembayaran" />
                        <div className="flex gap-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="LUNAS"
                                    checked={data.status === "LUNAS"}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm font-bold text-green-600">
                                    Lunas (Potong Saldo)
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value="HUTANG"
                                    checked={data.status === "HUTANG"}
                                    onChange={(e) =>
                                        setData("status", e.target.value)
                                    }
                                    className="text-red-600 focus:ring-red-500"
                                />
                                <span className="text-sm font-bold text-orange-600">
                                    Hutang (Bayar Nanti)
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Sumber Dana hanya aktif jika LUNAS */}
                        <div
                            className={
                                data.status === "HUTANG" ? "opacity-50" : ""
                            }
                        >
                            <InputLabel value="Sumber Dana" />
                            <select
                                disabled={data.status === "HUTANG"}
                                className="w-full border-gray-300 rounded-lg mt-1"
                                value={data.akun_id}
                                onChange={(e) =>
                                    setData("akun_id", e.target.value)
                                }
                            >
                                {akuns.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.nama}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Kategori" />
                            <select
                                className="w-full border-gray-300 rounded-lg mt-1"
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                            >
                                <option value="">-- Pilih Kategori --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nama}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4"></div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <InputLabel value="Opsi Supplier & Barang (Jika Kulakan)" />
                        <div>
                            <InputLabel
                                value={
                                    data.status === "HUTANG"
                                        ? "Pilih Supplier (Wajib untuk Hutang)"
                                        : "Pilih Supplier (Opsional)"
                                }
                            />
                            <select
                                className={`w-full border-gray-300 rounded-lg text-xs mt-1 ${errors.contact_id ? "border-red-500" : ""}`}
                                value={data.contact_id}
                                onChange={(e) =>
                                    handleSupplierChange(e.target.value)
                                }
                            >
                                <option value="">-- Pilih Supplier --</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.nama}
                                    </option>
                                ))}
                            </select>
                            {/* Tampilkan pesan error jika lupa pilih supplier saat hutang */}
                            <InputError
                                message={errors.contact_id}
                                className="mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2 mb-4">
                            <select
                                className="w-full border-gray-300 rounded-lg text-xs"
                                value={data.supplier_item_id}
                                onChange={(e) =>
                                    handleItemChange(e.target.value)
                                }
                                disabled={!data.contact_id}
                            >
                                <option value="">
                                    -- Pilih Barang Katalog --
                                </option>
                                {filteredItems.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.nama_barang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Kalkulator Inputan - Tidak dikirim ke server, hanya untuk cari Nominal */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div>
                                <InputLabel
                                    value="Harga Satuan (Rp)"
                                    className="text-[10px]"
                                />
                                <TextInput
                                    type="number"
                                    className="w-full mt-1 text-sm"
                                    value={hargaSatuan}
                                    onChange={(e) =>
                                        setHargaSatuan(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel
                                    value="Jumlah (Qty)"
                                    className="text-[10px]"
                                />
                                <TextInput
                                    type="number"
                                    className="w-full mt-1 text-sm"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* FIELD UTAMA (Yang dikirim ke Database) */}
                    <div className="mb-4">
                        <InputLabel value="Total Pengeluaran (Otomatis)" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm font-bold">
                                    Rp
                                </span>
                            </div>
                            <TextInput
                                type="number"
                                className="block w-full pl-10 bg-gray-100 font-black text-red-600 border-red-200"
                                value={data.nominal}
                                readOnly // Biar user tidak ubah manual, harus lewat qty/harga
                            />
                        </div>
                        <InputError message={errors.nominal} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Nominal Pengeluaran" />
                        <TextInput
                            type="number"
                            className="w-full mt-1 font-bold text-red-600"
                            value={data.nominal}
                            onChange={(e) => setData("nominal", e.target.value)}
                        />
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Keterangan" />
                        <TextInput
                            className="w-full mt-1"
                            value={data.keterangan}
                            onChange={(e) =>
                                setData("keterangan", e.target.value)
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            className="bg-red-600"
                            disabled={processing}
                        >
                            Simpan Pengeluaran
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

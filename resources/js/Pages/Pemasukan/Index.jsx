import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import {
    Plus,
    Search,
    ArrowDownCircle,
    Trash2,
    Calendar,
    Wallet,
    User,
    ArrowUpCircle,
} from "lucide-react";

export default function PemasukanIndex({
    auth,
    pemasukans,
    akuns,
    contacts_in,
    contacts_out,
    totalPemasukan,
    categories_in,
    categories_out,
    supplierItems,
    filters,
}) {
    const today = new Date().toISOString().split("T")[0];

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isModalPengeluaranOpen, setIsModalPengeluaranOpen] = useState(false);
    const [selectedPemasukan, setSelectedPemasukan] = useState(null);

    const [qtyModal, setQtyModal] = useState(1);
    const [hargaSatuanModal, setHargaSatuanModal] = useState(0);
    const [filteredItemsModal, setFilteredItemsModal] = useState([]);

    // State untuk filter
    const [filterData, setFilterData] = useState({
        startDate: filters.startDate || "",
        endDate: filters.endDate || "",
        status: filters.status || "", // Ini biasanya yang menyebabkan error karena null dari database
    });

    // Fungsi untuk menjalankan filter
    const handleFilter = () => {
        console.log("Menjalankan filter dengan data:", filterData);

        router.get(route("pemasukans.index"), filterData, {
            preserveState: true, // Menjaga input agar tidak reset
            replace: true, // Mengganti history URL agar tidak menumpuk saat klik back
            preserveScroll: true, // Menjaga posisi scroll halaman
        });
    };

    useEffect(() => {
        if (filterData.status !== filters.status) handleFilter();
    }, [filterData.status]);

    // Form Pemasukan
    const { data, setData, post, processing, errors, reset } = useForm({
        akun_id: akuns[0]?.id || "",
        contact_id: "",
        category_id: "", // State baru untuk kategori
        nominal: "",
        tanggal: new Date().toISOString().split("T")[0],
        keterangan: "",
        status: "LUNAS",
    });

    // Form Pengeluaran (Biaya Modal)
    const {
        data: dataKeluar,
        setData: setDataKeluar,
        post: postKeluar,
        processing: processingKeluar,
        reset: resetKeluar,
        errors: errorsKeluar, // Ambil error khusus modal pengeluaran
    } = useForm({
        akun_id: akuns[0]?.id || "",
        category_id: "",
        contact_id: "",
        pemasukan_ref_id: "", // Ganti pemasukan_id jadi pemasukan_ref_id sesuai DB
        supplier_item_id: "",
        nominal: 0,
        tanggal: new Date().toISOString().split("T")[0],
        keterangan: "",
        status: "LUNAS", // Tambahkan status
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("pemasukans.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    useEffect(() => {
        setDataKeluar("nominal", qtyModal * hargaSatuanModal);
    }, [qtyModal, hargaSatuanModal]);

    const handleSupplierChangeModal = (id) => {
        setDataKeluar("contact_id", id);
        // supplierItems harus di-pass sebagai props ke component ini
        setFilteredItemsModal(
            supplierItems.filter((item) => item.contact_id == id),
        );
    };

    const handleItemChangeModal = (id) => {
        setDataKeluar("supplier_item_id", id);
        const item = supplierItems.find((i) => i.id == id);
        if (item) {
            setHargaSatuanModal(item.harga_satuan);
            setDataKeluar(
                "keterangan",
                `Beli ${item.nama_barang} untuk modal: ${selectedPemasukan?.keterangan}`,
            );
        }
    };

    const openModalPengeluaran = (pemasukan) => {
        setSelectedPemasukan(pemasukan);
        setDataKeluar("pemasukan_ref_id", pemasukan.id); // Set ref ID
        setDataKeluar(
            "keterangan",
            `Biaya modal untuk: ${pemasukan.keterangan}`,
        );
        setQtyModal(1);
        setHargaSatuanModal(0);
        setIsModalPengeluaranOpen(true);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center w-full">
                    <div>
                        <h2 className="font-bold text-2xl text-gray-800">
                            Catatan Pemasukan
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Pantau semua arus kas masuk Anda.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">
                            Total Pemasukan
                        </p>
                        <p className="text-2xl font-black text-primary-600">
                            {formatRupiah(totalPemasukan)}
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Pemasukan" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <ArrowDownCircle
                            className="text-primary-500"
                            size={20}
                        />
                        Riwayat Transaksi
                    </h3>
                    <PrimaryButton
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary-600"
                    >
                        <Plus size={16} className="mr-2" /> Catat Pemasukan
                    </PrimaryButton>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-end gap-4">
                    {/* Input Tanggal Awal */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                            Dari
                        </label>
                        <input
                            type="date"
                            className="border-gray-200 rounded-lg text-sm"
                            value={filterData.startDate}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    startDate: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Input Tanggal Akhir */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                            Sampai
                        </label>
                        <input
                            type="date"
                            className="border-gray-200 rounded-lg text-sm"
                            value={filterData.endDate}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    endDate: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Filter Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                            Status
                        </label>
                        <select
                            className="border-gray-200 rounded-lg text-sm"
                            value={filterData.status}
                            onChange={(e) =>
                                setFilterData({
                                    ...filterData,
                                    status: e.target.value,
                                })
                            }
                        >
                            <option value="">Semua</option>
                            <option value="LUNAS">LUNAS</option>
                            <option value="PIUTANG">PIUTANG</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleFilter}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm shadow-primary-200"
                        >
                            Cari
                        </button>
                        <button
                            onClick={() => {
                                setFilterData({
                                    startDate: today,
                                    endDate: today,
                                    status: "",
                                });
                                router.get(route("pemasukans.index"), {
                                    startDate: today,
                                    endDate: today,
                                });
                            }}
                            className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Tanggal
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Kategori
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Keterangan
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Akun / Bank
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Nominal
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Total Modal
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Profit
                                </th>

                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        {/* TABEL BODY */}
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {pemasukans.map((item) => {
                                const totalModal =
                                    parseFloat(item.nominal) -
                                    parseFloat(item.profit);
                                const profit = parseFloat(item.profit);

                                return (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/50 group"
                                    >
                                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                            {item.tanggal}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.category ? (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded font-medium border border-blue-100">
                                                    {item.category.nama}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">
                                                    Tanpa Kategori
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">
                                                {item.keterangan}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-[10px] font-bold">
                                                    {item.contact?.nama?.charAt(
                                                        0,
                                                    ) || "U"}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {item.contact?.nama ||
                                                        "Umum"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    item.status === "LUNAS"
                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                        : "bg-orange-50 text-orange-700 border-orange-200"
                                                }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-black text-primary-600">
                                                {formatRupiah(item.nominal)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="text-red-500 font-medium">
                                                {totalModal > 0
                                                    ? `-${formatRupiah(totalModal)}`
                                                    : formatRupiah(0)}
                                            </span>
                                        </td>

                                        {/* KOLOM PROFIT */}
                                        <td className="px-6 py-4">
                                            <div
                                                className={`inline-flex items-center px-2 py-1 rounded-lg font-black ${
                                                    profit >= 0
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-red-100 text-red-700"
                                                }`}
                                            >
                                                {formatRupiah(profit)}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        openModalPengeluaran(
                                                            item,
                                                        )
                                                    }
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white transition-all text-[11px] font-bold"
                                                >
                                                    <ArrowUpCircle size={14} />
                                                    Input Modal
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteData(item.id)
                                                    }
                                                    className="p-1.5 text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL INPUT */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold mb-6 border-b pb-3">
                        Catat Pemasukan Baru
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Pilih Customer" />
                        <select
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 mt-1"
                            value={data.contact_id}
                            onChange={(e) =>
                                setData("contact_id", e.target.value)
                            }
                        >
                            <option value="">-- Pilih Customer --</option>
                            {contacts_in.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nama}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.contact_id} />
                    </div>
                    <div className="mb-4">
                        <InputLabel value="Kategori Pendapatan" />
                        <select
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 mt-1"
                            value={data.category_id}
                            onChange={(e) =>
                                setData("category_id", e.target.value)
                            }
                        >
                            <option value="">
                                -- Pilih Kategori (Contoh: Pendapatan Cetak) --
                            </option>
                            {categories_in.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nama}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.category_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Status Pembayaran" />
                            <select
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 mt-1"
                                value={data.status}
                                onChange={(e) =>
                                    setData("status", e.target.value)
                                }
                            >
                                <option value="LUNAS">
                                    LUNAS (Masuk Saldo)
                                </option>
                                <option value="PIUTANG">
                                    PIUTANG (Belum Bayar)
                                </option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Nominal (Rp)" />
                            <TextInput
                                type="number"
                                className="w-full mt-1"
                                value={data.nominal}
                                onChange={(e) =>
                                    setData("nominal", e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Tanggal" />
                            <TextInput
                                type="date"
                                className="w-full"
                                value={data.tanggal}
                                onChange={(e) =>
                                    setData("tanggal", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <InputLabel value="Pilih Akun" />
                            <select
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500"
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
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Keterangan" />
                        <TextInput
                            className="w-full"
                            value={data.keterangan}
                            onChange={(e) =>
                                setData("keterangan", e.target.value)
                            }
                            placeholder="Contoh: Pembayaran Jasa Website"
                        />
                        <InputError message={errors.keterangan} />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Simpan Transaksi
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <Modal
                show={isModalPengeluaranOpen}
                onClose={() => setIsModalPengeluaranOpen(false)}
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        postKeluar(route("pengeluarans.store"), {
                            onSuccess: () => {
                                setIsModalPengeluaranOpen(false);
                                resetKeluar();
                            },
                        });
                    }}
                    className="p-6"
                >
                    <h2 className="text-lg font-bold mb-4 text-red-600 border-b pb-2 flex items-center gap-2">
                        <ArrowUpCircle size={20} /> Catat Biaya Modal Proyek
                    </h2>

                    {/* Info Ringkas Proyek */}
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase">
                            Proyek:
                        </p>
                        <p className="text-sm font-bold text-blue-900">
                            {selectedPemasukan?.keterangan}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Status Pembayaran" />
                            <select
                                className="w-full border-gray-300 rounded-lg mt-1 text-sm font-bold"
                                value={dataKeluar.status}
                                onChange={(e) =>
                                    setDataKeluar("status", e.target.value)
                                }
                            >
                                <option value="LUNAS">✅ LUNAS</option>
                                <option value="HUTANG">⏳ HUTANG</option>
                            </select>
                        </div>
                        <div>
                            <InputLabel value="Kategori Biaya" />
                            <select
                                className="w-full border-gray-300 rounded-lg mt-1 text-sm"
                                value={dataKeluar.category_id}
                                onChange={(e) =>
                                    setDataKeluar("category_id", e.target.value)
                                }
                            >
                                <option value="">-- Pilih Kategori --</option>
                                {categories_out
                                    .filter((c) => c.jenis === "PENGELUARAN")
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nama}
                                        </option>
                                    ))}
                            </select>
                            <InputError message={errorsKeluar.category_id} />
                        </div>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <InputLabel value="Opsi Supplier & Katalog (Jika ada)" />
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <select
                                className="w-full border-gray-300 rounded-lg text-xs"
                                value={dataKeluar.contact_id}
                                onChange={(e) =>
                                    handleSupplierChangeModal(e.target.value)
                                }
                            >
                                <option value="">-- Pilih Supplier --</option>
                                {contacts_out
                                    .filter(
                                        (c) =>
                                            c.jenis === "SUPPLIER" ||
                                            c.jenis === "BOTH",
                                    )
                                    .map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nama}
                                        </option>
                                    ))}
                            </select>
                            <select
                                className="w-full border-gray-300 rounded-lg text-xs"
                                value={dataKeluar.supplier_item_id}
                                onChange={(e) =>
                                    handleItemChangeModal(e.target.value)
                                }
                                disabled={!dataKeluar.contact_id}
                            >
                                <option value="">-- Pilih Barang --</option>
                                {filteredItemsModal.map((i) => (
                                    <option key={i.id} value={i.id}>
                                        {i.nama_barang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Kalkulator */}
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                            <div>
                                <InputLabel
                                    value="Harga Satuan"
                                    className="text-[10px]"
                                />
                                <TextInput
                                    type="number"
                                    className="w-full mt-1 text-sm"
                                    value={hargaSatuanModal}
                                    onChange={(e) =>
                                        setHargaSatuanModal(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <InputLabel
                                    value="Qty"
                                    className="text-[10px]"
                                />
                                <TextInput
                                    type="number"
                                    className="w-full mt-1 text-sm"
                                    value={qtyModal}
                                    onChange={(e) =>
                                        setQtyModal(e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Total Biaya (Otomatis)" />
                        <TextInput
                            className="w-full mt-1 bg-gray-100 font-black text-red-600 border-red-200"
                            value={dataKeluar.nominal}
                            readOnly
                        />
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Sumber Dana" />
                        <select
                            disabled={dataKeluar.status === "HUTANG"}
                            className={`w-full border-gray-300 rounded-lg mt-1 ${dataKeluar.status === "HUTANG" ? "bg-gray-100" : ""}`}
                            value={dataKeluar.akun_id}
                            onChange={(e) =>
                                setDataKeluar("akun_id", e.target.value)
                            }
                        >
                            {akuns.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nama}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Keterangan Tambahan" />
                        <TextInput
                            className="w-full mt-1"
                            value={dataKeluar.keterangan}
                            onChange={(e) =>
                                setDataKeluar("keterangan", e.target.value)
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton
                            onClick={() => setIsModalPengeluaranOpen(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            className="bg-red-600 hover:bg-red-700"
                            disabled={processingKeluar}
                        >
                            Simpan Biaya Modal
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

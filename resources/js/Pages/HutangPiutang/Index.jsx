import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, router } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import Select from "react-select";
import {
    Plus,
    Search,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    User,
    MoreVertical,
    CheckCircle2,
    Clock,
    FileText,
    Pencil,
} from "lucide-react";

export default function HutangPiutangIndex({
    auth,
    hutangPiutangs,
    contacts,
    allContacts,
    akuns,
    filters,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filterJenis, setFilterJenis] = useState(filters.jenis || "PIUTANG");

    // Form untuk Tambah Data Baru
    const { data, setData, post, processing, errors, reset } = useForm({
        contact_id: "",
        jenis: "PIUTANG",
        status: "TAGIHAN_OPEN",
        nominal: "",
        keterangan: "",
        jatuh_tempo: "",
    });

    // Form untuk Edit Data
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        id: "",
        contact_id: "",
        nominal: "",
        keterangan: "",
        jatuh_tempo: "",
    });

    // Form untuk Proses Pelunasan
    const {
        data: payData,
        setData: setPayData,
        post: postPay,
        processing: payProcessing,
    } = useForm({
        akun_id: akuns[0]?.id || "",
        tanggal_bayar: new Date().toISOString().split("T")[0],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("hutang-piutang.store"), {
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        putEdit(route("hutang-piutang.update", editData.id), {
            onSuccess: () => {
                setIsEditModalOpen(false);
                resetEdit();
            },
        });
    };

    const handlePelunasan = (e) => {
        e.preventDefault();
        postPay(route("hutang-piutang.pelunasan", selectedItem.id), {
            onSuccess: () => setIsPayModalOpen(false),
        });
    };

    const openEditModal = (item) => {
        setSelectedItem(item);
        setEditData({
            id: item.id,
            contact_id: item.contact_id,
            nominal: item.nominal,
            keterangan: item.keterangan,
            jatuh_tempo: item.jatuh_tempo || "",
        });
        setIsEditModalOpen(true);
    };

    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    // Handle Tab Change (Reload Data)
    const handleTabChange = (type) => {
        setFilterJenis(type);
        router.get(
            route("hutang-piutang.index"),
            { jenis: type }, // Reset contact_id saat ganti tab
            { preserveState: true },
        );
    };

    // Handle Contact Filter Change
    const handleContactChange = (option) => {
        router.get(
            route("hutang-piutang.index"),
            { jenis: filterJenis, contact_id: option ? option.value : "" },
            { preserveState: true },
        );
    };

    const contactOptions = contacts.map((c) => ({
        value: c.id,
        label: c.nama,
    }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-2xl text-gray-800">
                        Manajemen Hutang Piutang
                    </h2>
                    <PrimaryButton onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-1" /> Catat Baru
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="Hutang Piutang" />

            {/* Tab Selector */}
            <div className="flex p-1 bg-gray-100 rounded-xl w-fit mb-6 border border-gray-200">
                <button
                    onClick={() => handleTabChange("PIUTANG")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${filterJenis === "PIUTANG" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <ArrowDownLeft size={16} /> Piutang (Tagihan Kita)
                </button>
                <button
                    onClick={() => handleTabChange("HUTANG")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${filterJenis === "HUTANG" ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    <ArrowUpRight size={16} /> Hutang (Kewajiban)
                </button>
            </div>

            {/* Filter Dropdown */}
            <div className="mb-4 w-full md:w-1/3 z-20 relative">
                <Select
                    options={contactOptions}
                    isClearable
                    placeholder={`Cari ${filterJenis === "PIUTANG" ? "Customer" : "Supplier"}...`}
                    onChange={handleContactChange}
                    defaultValue={
                        filters.contact_id
                            ? contactOptions.find(
                                  (c) => c.value == filters.contact_id,
                              )
                            : null
                    }
                    className="text-sm"
                    styles={{
                        control: (base) => ({
                            ...base,
                            borderRadius: "0.5rem",
                            borderColor: "#e5e7eb",
                            padding: "2px",
                        }),
                    }}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                        <tr>
                            <th className="px-6 py-4 text-left">
                                Kontak / Customer
                            </th>
                            <th className="px-6 py-4 text-left">Keterangan</th>
                            <th className="px-6 py-4 text-left">Jatuh Tempo</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-left">Nominal</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {hutangPiutangs.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50/50 group transition-colors"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${item.jenis === "PIUTANG" ? "bg-blue-100 text-blue-600" : "bg-red-100 text-red-600"}`}
                                        >
                                            {item.contact?.nama?.charAt(0)}
                                        </div>
                                        <div className="font-bold text-gray-900">
                                            {item.contact?.nama}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {item.keterangan}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Calendar size={14} />
                                        {item.jatuh_tempo || "-"}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                                            item.status === "LUNAS"
                                                ? "bg-green-50 text-green-700 border-green-200"
                                                : item.status === "TAGIHAN_OPEN"
                                                  ? "bg-orange-50 text-orange-600 border-orange-200"
                                                  : "bg-gray-50 text-gray-500 border-gray-200"
                                        }`}
                                    >
                                        {item.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td
                                    className={`px-6 py-4 font-black ${item.jenis === "PIUTANG" ? "text-blue-600" : "text-red-600"}`}
                                >
                                    {formatRupiah(item.nominal)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {/* Tombol Edit */}
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-all"
                                            title="Edit Data"
                                        >
                                            <Pencil size={18} />
                                        </button>

                                        {item.status === "ESTIMASI" && (
                                            <button
                                                onClick={() =>
                                                    router.post(
                                                        route(
                                                            "hutang-piutang.convert",
                                                            item.id,
                                                        ),
                                                    )
                                                }
                                                className="p-1.5 text-gray-400 hover:text-blue-600"
                                                title="Kirim Tagihan"
                                            >
                                                <FileText size={18} />
                                            </button>
                                        )}
                                        {item.status === "TAGIHAN_OPEN" && (
                                            <button
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsPayModalOpen(true);
                                                }}
                                                className="bg-gray-900 text-white px-3 py-1 rounded text-xs font-bold hover:bg-black transition-all"
                                            >
                                                Pelunasan
                                            </button>
                                        )}
                                        {item.status === "LUNAS" && (
                                            <CheckCircle2
                                                size={18}
                                                className="text-green-500"
                                            />
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL TAMBAH DATA */}
            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold mb-6 border-b pb-3">
                        Catat Hutang / Piutang
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Tipe Transaksi" />
                        <select
                            className="w-full border-gray-300 rounded-lg"
                            value={data.jenis}
                            onChange={(e) => setData("jenis", e.target.value)}
                        >
                            <option value="PIUTANG">
                                PIUTANG (Kita Menagih Orang)
                            </option>
                            <option value="HUTANG">
                                HUTANG (Kita Berhutang ke Supplier)
                            </option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Kontak / Nama" />
                        <select
                            className="w-full border-gray-300 rounded-lg"
                            value={data.contact_id}
                            onChange={(e) =>
                                setData("contact_id", e.target.value)
                            }
                        >
                            <option value="">-- Pilih Kontak --</option>
                            {allContacts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nama} ({c.jenis})
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.contact_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Nominal (Rp)" />
                            <TextInput
                                type="number"
                                className="w-full"
                                value={data.nominal}
                                onChange={(e) =>
                                    setData("nominal", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <InputLabel value="Jatuh Tempo" />
                            <TextInput
                                type="date"
                                className="w-full"
                                value={data.jatuh_tempo}
                                onChange={(e) =>
                                    setData("jatuh_tempo", e.target.value)
                                }
                            />
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
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Simpan Data
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL EDIT DATA */}
            <Modal
                show={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            >
                <form onSubmit={submitEdit} className="p-6">
                    <h2 className="text-lg font-bold mb-6 border-b pb-3 text-yellow-600">
                        Edit Data {selectedItem?.jenis}
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Kontak / Nama" />
                        <select
                            className={`w-full border-gray-300 rounded-lg ${
                                selectedItem?.terhubung_transaksi
                                    ? "bg-gray-100 cursor-not-allowed"
                                    : ""
                            }`}
                            value={editData.contact_id}
                            onChange={(e) =>
                                setEditData("contact_id", e.target.value)
                            }
                            disabled={selectedItem?.terhubung_transaksi}
                        >
                            <option value="">-- Pilih Kontak --</option>
                            {allContacts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nama} ({c.jenis})
                                </option>
                            ))}
                        </select>
                        {selectedItem?.terhubung_transaksi && (
                            <p className="text-[10px] text-red-500 mt-1">
                                *Kontak tidak dapat diubah karena terhubung
                                dengan data Pemasukan/Pengeluaran.
                            </p>
                        )}
                        <InputError message={editErrors.contact_id} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel value="Nominal (Rp)" />
                            <TextInput
                                type="number"
                                className="w-full"
                                value={editData.nominal}
                                onChange={(e) =>
                                    setEditData("nominal", e.target.value)
                                }
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                                *Perubahan nominal akan menyinkronkan data
                                terkait.
                            </p>
                            <InputError message={editErrors.nominal} />
                        </div>
                        <div>
                            <InputLabel value="Jatuh Tempo" />
                            <TextInput
                                type="date"
                                className="w-full"
                                value={editData.jatuh_tempo}
                                onChange={(e) =>
                                    setEditData("jatuh_tempo", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Keterangan" />
                        <TextInput
                            className="w-full"
                            value={editData.keterangan}
                            onChange={(e) =>
                                setEditData("keterangan", e.target.value)
                            }
                        />
                        <InputError message={editErrors.keterangan} />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton
                            onClick={() => setIsEditModalOpen(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={editProcessing}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL PELUNASAN */}
            <Modal
                show={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
            >
                <form onSubmit={handlePelunasan} className="p-6">
                    <h2 className="text-lg font-bold mb-2">Proses Pelunasan</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        Konfirmasi pembayaran untuk tagihan sebesar{" "}
                        <span className="font-bold text-gray-900">
                            {formatRupiah(selectedItem?.nominal)}
                        </span>
                    </p>

                    <div className="mb-4">
                        <InputLabel value="Gunakan Akun / Bank" />
                        <select
                            className="w-full border-gray-300 rounded-lg"
                            value={payData.akun_id}
                            onChange={(e) =>
                                setPayData("akun_id", e.target.value)
                            }
                        >
                            {akuns.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.nama} (Saldo: {formatRupiah(a.saldo)})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Tanggal Pembayaran" />
                        <TextInput
                            type="date"
                            className="w-full"
                            value={payData.tanggal_bayar}
                            onChange={(e) =>
                                setPayData("tanggal_bayar", e.target.value)
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton
                            onClick={() => setIsPayModalOpen(false)}
                        >
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            disabled={payProcessing}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Proses Lunas
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

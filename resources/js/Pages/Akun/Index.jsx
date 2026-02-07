import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Pencil, Trash2, Plus, Search, Filter } from "lucide-react";

export default function AkunIndex({ auth, akuns }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

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
        nama: "",
        saldo: 0,
    });

    const openModal = (akun = null) => {
        if (akun) {
            setIsEditMode(true);
            setData({ id: akun.id, nama: akun.nama, saldo: akun.saldo });
        } else {
            setIsEditMode(false);
            reset();
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
            ? put(route("akuns.update", data.id), { onSuccess: closeModal })
            : post(route("akuns.store"), { onSuccess: closeModal });
    };

    const deleteAkun = (id) => {
        if (confirm("Hapus akun ini?")) destroy(route("akuns.destroy", id));
    };

    // Helper Rupiah
    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    // Helper Acak Warna Avatar (Biar estetik kayak di gambar)
    const getAvatarColor = (char) => {
        const colors = [
            "bg-red-100 text-red-600",
            "bg-blue-100 text-blue-600",
            "bg-primary-600-100 text-primary-600-600",
            "bg-amber-100 text-amber-600",
            "bg-purple-100 text-purple-600",
        ];
        const index = char.charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800">
                        Manajemen Akun
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Kelola daftar rekening bank dan dompet tunai Anda.
                    </p>
                </div>
            }
        >
            <Head title="Kelola Akun" />

            {/* CARD UTAMA (Putih dengan Shadow) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar (Search & Filter) */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari akun..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-600-500 focus:border-primary-600-500"
                        />
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="bg-primary-600 hover:bg-primary-600-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary-600-200"
                    >
                        <Plus size={16} />
                        Tambah Akun Baru
                    </button>
                </div>

                {/* Tabel ala Admin Panel */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Nama Akun
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Saldo Saat Ini
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {akuns.length > 0 ? (
                                akuns.map((akun) => (
                                    <tr
                                        key={akun.id}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        {/* Kolom Nama dengan Avatar */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div
                                                    className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${getAvatarColor(akun.nama)}`}
                                                >
                                                    {akun.nama.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {akun.nama}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ID:{" "}
                                                        {akun.id
                                                            .toString()
                                                            .padStart(4, "0")}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Kolom Saldo */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                {formatRupiah(akun.saldo)}
                                            </span>
                                        </td>

                                        {/* Kolom Status Dummy (Biar mirip gambar) */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-[10px] leading-5 font-semibold rounded-full bg-primary-600-100 text-primary-600-800">
                                                AKTIF
                                            </span>
                                        </td>

                                        {/* Kolom Aksi */}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        openModal(akun)
                                                    }
                                                    className="p-1.5 rounded-md text-primary-600-600 hover:bg-primary-600-50 border border-transparent hover:border-primary-600-200 transition-all"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        deleteAkun(akun.id)
                                                    }
                                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button className="text-xs font-medium text-primary-600-600 border border-primary-600-200 bg-primary-600-50 px-3 py-1.5 rounded hover:bg-primary-600-100 transition-colors ml-2">
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4"
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        Data kosong
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL (Isinya sama kayak sebelumnya, cuma styling dikit) */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">
                        {isEditMode ? "Edit Data Akun" : "Tambah Akun Baru"}
                    </h2>
                    <div className="mb-4">
                        <InputLabel htmlFor="nama" value="Nama Akun" />
                        <TextInput
                            id="nama"
                            value={data.nama}
                            onChange={(e) => setData("nama", e.target.value)}
                            className="mt-1 block w-full rounded-lg"
                            isFocused
                        />
                        <InputError message={errors.nama} className="mt-2" />
                    </div>
                    <div className="mb-6">
                        <InputLabel htmlFor="saldo" value="Saldo Awal" />
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">
                                    Rp
                                </span>
                            </div>
                            <TextInput
                                id="saldo"
                                type="number"
                                value={data.saldo}
                                onChange={(e) =>
                                    setData("saldo", e.target.value)
                                }
                                className="block w-full pl-10 rounded-lg"
                            />
                        </div>
                        <InputError message={errors.saldo} className="mt-2" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            className="bg-primary-600-600 hover:bg-primary-600-700"
                            disabled={processing}
                        >
                            {processing ? "Menyimpan..." : "Simpan Data"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

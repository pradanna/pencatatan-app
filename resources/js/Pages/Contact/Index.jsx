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
    MapPin,
    Phone,
    User,
} from "lucide-react";

export default function ContactIndex({ auth, contacts }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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
        jenis: "CUSTOMER",
        no_hp: "",
        alamat: "",
    });

    const openModal = (contact = null) => {
        if (contact) {
            setIsEditMode(true);
            setData({
                id: contact.id,
                nama: contact.nama,
                jenis: contact.jenis,
                no_hp: contact.no_hp || "",
                alamat: contact.alamat || "",
            });
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
            ? put(route("contacts.update", data.id), { onSuccess: closeModal })
            : post(route("contacts.store"), { onSuccess: closeModal });
    };

    const deleteContact = (id) => {
        if (confirm("Hapus kontak ini?"))
            destroy(route("contacts.destroy", id));
    };

    // Filter Search
    const filteredContacts = contacts.filter((contact) =>
        contact.nama.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // Helper Badge Warna Jenis
    const getTypeBadge = (type) => {
        switch (type) {
            case "CUSTOMER":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "SUPPLIER":
                return "bg-orange-100 text-orange-700 border-orange-200";
            default:
                return "bg-purple-100 text-purple-700 border-purple-200"; // BOTH
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800">
                        Data Kontak
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Database Customer dan Supplier Anda.
                    </p>
                </div>
            }
        >
            <Head title="Data Kontak" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama kontak..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-primary-200"
                    >
                        <Plus size={16} />
                        Tambah Kontak
                    </button>
                </div>

                {/* Tabel */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Nama & Tipe
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Kontak Info
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Alamat
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {filteredContacts.length > 0 ? (
                                filteredContacts.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-gray-50/80 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                    <User size={20} />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {item.nama}
                                                    </div>
                                                    <span
                                                        className={`px-2 py-0.5 mt-1 inline-flex text-[10px] font-semibold rounded border ${getTypeBadge(item.jenis)}`}
                                                    >
                                                        {item.jenis}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.no_hp ? (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Phone
                                                        size={14}
                                                        className="mr-2 text-gray-400"
                                                    />
                                                    {item.no_hp}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.alamat ? (
                                                <div className="flex items-start text-sm text-gray-600 max-w-xs truncate">
                                                    <MapPin
                                                        size={14}
                                                        className="mr-2 mt-0.5 text-gray-400 flex-shrink-0"
                                                    />
                                                    <span className="truncate">
                                                        {item.alamat}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    -
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
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
                                                        deleteContact(item.id)
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
                                        colSpan="4"
                                        className="px-6 py-10 text-center text-gray-500"
                                    >
                                        Data tidak ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM */}
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">
                        {isEditMode ? "Edit Kontak" : "Tambah Kontak Baru"}
                    </h2>

                    {/* Nama */}
                    <div className="mb-4">
                        <InputLabel
                            htmlFor="nama"
                            value="Nama Lengkap / Perusahaan"
                        />
                        <TextInput
                            id="nama"
                            value={data.nama}
                            onChange={(e) => setData("nama", e.target.value)}
                            className="mt-1 block w-full rounded-lg"
                            isFocused
                        />
                        <InputError message={errors.nama} className="mt-2" />
                    </div>

                    {/* Jenis & No HP (Grid 2 Kolom) */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <InputLabel htmlFor="jenis" value="Tipe Kontak" />
                            <select
                                id="jenis"
                                value={data.jenis}
                                onChange={(e) =>
                                    setData("jenis", e.target.value)
                                }
                                className="mt-1 block w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-lg shadow-sm"
                            >
                                <option value="CUSTOMER">
                                    Customer (Pelanggan)
                                </option>
                                <option value="SUPPLIER">
                                    Supplier (Pemasok)
                                </option>
                                <option value="BOTH">Keduanya</option>
                            </select>
                            <InputError
                                message={errors.jenis}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <InputLabel
                                htmlFor="no_hp"
                                value="No. WhatsApp / HP"
                            />
                            <TextInput
                                id="no_hp"
                                value={data.no_hp}
                                onChange={(e) =>
                                    setData("no_hp", e.target.value)
                                }
                                className="mt-1 block w-full rounded-lg"
                                placeholder="08..."
                            />
                            <InputError
                                message={errors.no_hp}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    {/* Alamat */}
                    <div className="mb-6">
                        <InputLabel htmlFor="alamat" value="Alamat Lengkap" />
                        <textarea
                            id="alamat"
                            value={data.alamat}
                            onChange={(e) => setData("alamat", e.target.value)}
                            className="mt-1 block w-full border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-lg shadow-sm h-24"
                            placeholder="Alamat jalan, kota..."
                        ></textarea>
                        <InputError message={errors.alamat} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton
                            className="bg-primary-600 hover:bg-primary-700"
                            disabled={processing}
                        >
                            {processing ? "Menyimpan..." : "Simpan Kontak"}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

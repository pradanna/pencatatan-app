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
    Plus,
    Pencil,
    Trash2,
    Tag,
    ArrowDownCircle,
    ArrowUpCircle,
} from "lucide-react";

export default function CategoryIndex({ auth, categories }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

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
        nama: "",
        jenis: "PENGELUARAN",
    });

    const openModal = (category = null) => {
        if (category) {
            setEditData(category);
            setData({ nama: category.nama, jenis: category.jenis });
        } else {
            setEditData(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editData) {
            put(route("categories.update", editData.id), {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post(route("categories.store"), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-bold text-2xl text-gray-800">
                    Master Kategori
                </h2>
            }
        >
            <Head title="Kategori" />

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-4">
                    <PrimaryButton onClick={() => openModal()}>
                        <Plus size={16} className="mr-2" /> Tambah Kategori
                    </PrimaryButton>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                                    Nama Kategori
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">
                                    Jenis
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {categories.map((cat) => (
                                <tr
                                    key={cat.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {cat.nama}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                                cat.jenis === "PEMASUKAN"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-700"
                                            }`}
                                        >
                                            {cat.jenis === "PEMASUKAN" ? (
                                                <ArrowDownCircle size={12} />
                                            ) : (
                                                <ArrowUpCircle size={12} />
                                            )}
                                            {cat.jenis}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openModal(cat)}
                                            className="text-blue-600 mr-3"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirm("Hapus kategori?") &&
                                                destroy(
                                                    route(
                                                        "categories.destroy",
                                                        cat.id,
                                                    ),
                                                )
                                            }
                                            className="text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-bold mb-6">
                        {editData ? "Edit Kategori" : "Tambah Kategori Baru"}
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Nama Kategori" />
                        <TextInput
                            className="w-full mt-1"
                            placeholder="Contoh: Makan, Jajan, Jasa Web, Cetak"
                            value={data.nama}
                            onChange={(e) => setData("nama", e.target.value)}
                        />
                        <InputError message={errors.nama} />
                    </div>

                    <div className="mb-6">
                        <InputLabel value="Digunakan Untuk" />
                        <select
                            className="w-full border-gray-300 rounded-lg shadow-sm mt-1"
                            value={data.jenis}
                            onChange={(e) => setData("jenis", e.target.value)}
                        >
                            <option value="PENGELUARAN">
                                PENGELUARAN (Makan, Jajan, Modal, dll)
                            </option>
                            <option value="PEMASUKAN">
                                PEMASUKAN (Hasil Cetak, Jasa, dll)
                            </option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

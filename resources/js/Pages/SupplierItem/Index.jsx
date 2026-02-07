import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
import { Pencil, Trash2, Plus, Search, BookOpen, Truck } from "lucide-react";

export default function SupplierItemIndex({ auth, items, suppliers }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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
        contact_id: "",
        nama_barang: "",
        harga_satuan: "",
        satuan: "Pcs",
    });

    const openModal = (item = null) => {
        if (item) {
            setIsEditMode(true);
            setData({
                id: item.id,
                contact_id: item.contact_id,
                nama_barang: item.nama_barang,
                harga_satuan: item.harga_satuan,
                satuan: item.satuan,
            });
        } else {
            setIsEditMode(false);
            reset();
            if (suppliers.length > 0) setData("contact_id", suppliers[0].id);
        }
        setIsModalOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        isEditMode
            ? put(route("supplier-items.update", data.id), {
                  onSuccess: () => setIsModalOpen(false),
              })
            : post(route("supplier-items.store"), {
                  onSuccess: () => setIsModalOpen(false),
              });
    };

    const formatRupiah = (num) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(num);

    const filteredItems = items.filter((i) =>
        i.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-bold text-2xl text-gray-800">
                        Katalog Harga Supplier
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Daftar referensi harga barang dari berbagai supplier.
                    </p>
                </div>
            }
        >
            <Head title="Katalog Supplier" />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <div className="relative w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                            placeholder="Cari barang..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <PrimaryButton
                        onClick={() => openModal()}
                        className="bg-primary-600"
                    >
                        <Plus size={16} className="mr-2" /> Tambah Katalog
                    </PrimaryButton>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Nama Barang
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Supplier
                                </th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase">
                                    Harga Satuan
                                </th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded flex items-center justify-center mr-3">
                                                <BookOpen size={16} />
                                            </div>
                                            <div className="text-sm font-bold text-gray-900">
                                                {item.nama_barang}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Truck
                                                size={14}
                                                className="mr-2 text-gray-400"
                                            />
                                            {item.contact?.nama}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-primary-600">
                                            {formatRupiah(item.harga_satuan)}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-1">
                                            / {item.satuan}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openModal(item)}
                                            className="text-primary-600 mr-3"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                confirm("Hapus?") &&
                                                destroy(
                                                    route(
                                                        "supplier-items.destroy",
                                                        item.id,
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
                    <h2 className="text-lg font-bold mb-6 border-b pb-3">
                        {isEditMode ? "Edit Katalog" : "Tambah Katalog"}
                    </h2>

                    <div className="mb-4">
                        <InputLabel value="Pilih Supplier" />
                        <select
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500"
                            value={data.contact_id}
                            onChange={(e) =>
                                setData("contact_id", e.target.value)
                            }
                        >
                            <option value="">-- Pilih Supplier --</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.nama}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.contact_id} />
                    </div>

                    <div className="mb-4">
                        <InputLabel value="Nama Barang" />
                        <TextInput
                            className="w-full"
                            value={data.nama_barang}
                            onChange={(e) =>
                                setData("nama_barang", e.target.value)
                            }
                        />
                        <InputError message={errors.nama_barang} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <InputLabel value="Harga Satuan" />
                            <TextInput
                                type="number"
                                className="w-full"
                                value={data.harga_satuan}
                                onChange={(e) =>
                                    setData("harga_satuan", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <InputLabel value="Satuan" />
                            <TextInput
                                className="w-full"
                                value={data.satuan}
                                onChange={(e) =>
                                    setData("satuan", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setIsModalOpen(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Simpan Katalog
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}

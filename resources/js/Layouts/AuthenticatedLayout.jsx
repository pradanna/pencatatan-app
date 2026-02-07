import { useState } from "react";
import Sidebar from "@/Components/Sidebar";
import { Menu, Bell, Search, ChevronDown } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

export default function Authenticated({ header, children }) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const { props } = usePage();
    const user = props.auth.user;

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            {/* SIDEBAR */}
            <Sidebar />

            {/* KONTEN KANAN */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* TOPBAR / HEADER */}
                <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm z-10">
                    {/* Kiri: Search Bar (Hiasan dulu) */}
                    <div className="flex items-center flex-1">
                        <button
                            className="md:hidden mr-4 text-gray-500"
                            onClick={() =>
                                setShowingNavigationDropdown(
                                    !showingNavigationDropdown,
                                )
                            }
                        >
                            <Menu size={24} />
                        </button>

                        <div className="relative w-full max-w-md hidden md:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary-600-500 focus:border-primary-600-500 sm:text-sm"
                                placeholder="Cari fitur, data, atau bantuan..."
                            />
                        </div>
                    </div>

                    {/* Kanan: Notifikasi & User Dropdown */}
                    <div className="ml-4 flex items-center md:ml-6 gap-4">
                        <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                            <Bell size={20} />
                        </button>

                        <div className="relative flex items-center gap-2 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                                {user.name.charAt(0)}
                            </div>
                            <div className="hidden md:block text-sm text-gray-700 font-medium">
                                {user.name}
                            </div>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                    </div>
                </header>

                {/* AREA KONTEN (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {/* Header Halaman (Breadcrumb/Judul Kecil) */}
                    {header && <div className="mb-6">{header}</div>}

                    {children}
                </div>
            </main>
        </div>
    );
}

import React from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    LayoutDashboard,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    CreditCard,
    Users,
    Package,
    LogOut,
    Package2,
    BookImage,
    ChartBarBig,
    ChartBar,
    ChartAreaIcon,
    ChartArea,
    ChartBarDecreasing,
    ChartBarIncreasingIcon,
    ChartNoAxesColumn,
    ChartNoAxesCombined,
    CalendarDays,
    TrendingUp,
    TrendingDown,
    ReceiptPoundSterling,
} from "lucide-react";

export default function Sidebar() {
    const { url, props } = usePage();
    const user = props.auth.user;

    // Struktur menu dengan kategori
    const menuGroups = [
        {
            group: "Utama",
            items: [
                {
                    name: "Dashboard",
                    route: "dashboard.index",
                    icon: <LayoutDashboard size={18} />,
                },
            ],
        },
        {
            group: "Transaksi",
            items: [
                {
                    name: "Pemasukan",
                    route: "pemasukans.index",
                    icon: <ArrowDownCircle size={18} />,
                },
                {
                    name: "Pengeluaran",
                    route: "pengeluarans.index",
                    icon: <ArrowUpCircle size={18} />,
                },
                {
                    name: "Hutang Piutang",
                    route: "hutang-piutang.index",
                    icon: <CreditCard size={18} />,
                },
                {
                    name: "Stock",
                    route: "stocks.index",
                    icon: <Package2 size={18} />,
                },
            ],
        },
        {
            group: "Master Data",
            items: [
                {
                    name: "Manajemen Akun",
                    route: "akuns.index",
                    icon: <Wallet size={18} />,
                },
                {
                    name: "Data Kontak",
                    route: "contacts.index",
                    icon: <Users size={18} />,
                },
                {
                    name: "Katalog Produk",
                    route: "supplier-items.index",
                    icon: <Package size={18} />,
                },
                {
                    name: "Kategori",
                    route: "categories.index",
                    icon: <BookImage size={18} />,
                },
            ],
        },
        {
            group: "Laporan",
            items: [
                {
                    name: "Pemasukan",
                    route: "laporan-pemasukan.index",
                    icon: <TrendingUp size={18} />,
                },
                {
                    name: "Pengeluaran",
                    route: "laporan-pengeluaran.index",
                    icon: <TrendingDown size={18} />,
                },
                {
                    name: "Hutang Piutang",
                    route: "laporan-hutang-piutang.index",
                    icon: <ReceiptPoundSterling size={18} />,
                },
                {
                    name: "Daily Cashflow",
                    route: "daily-cashflow.index",
                    icon: <CalendarDays size={18} />,
                },
            ],
        },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white border-r border-slate-800 min-h-screen flex flex-col hidden md:flex">
            {/* 1. Header Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-primary-400">
                        AdminPanel
                    </span>
                    <span className="text-[10px] text-slate-400 tracking-wider uppercase">
                        Finance System
                    </span>
                </div>
            </div>

            {/* 2. Menu List */}
            <nav className="flex-1 overflow-y-auto py-4">
                {menuGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-6">
                        {/* Judul Grup Menu */}
                        <div className="px-6 mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px]">
                                {group.group}
                            </span>
                        </div>

                        <ul className="space-y-1 px-3">
                            {group.items.map((item, index) => {
                                const isActive = url.startsWith(
                                    "/" + item.route.split(".")[0],
                                );

                                return (
                                    <li key={index}>
                                        <Link
                                            href={route(item.route)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                                ${
                                                    isActive
                                                        ? "bg-primary-600 text-white shadow-lg shadow-primary-900/40"
                                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                                                }`}
                                        >
                                            {item.icon}
                                            {item.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* 3. User Profile di Bawah */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold border border-primary-500/30">
                        {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                            {user.name}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate uppercase">
                            Super Admin
                        </p>
                    </div>
                </div>

                <Link
                    method="post"
                    href={route("logout")}
                    as="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-red-400 transition-colors border border-slate-800 rounded-lg hover:border-red-900/30"
                >
                    <LogOut size={14} />
                    Keluar Aplikasi
                </Link>
            </div>
        </aside>
    );
}

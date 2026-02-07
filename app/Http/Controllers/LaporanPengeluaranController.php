<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use App\Models\Contact;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LaporanPengeluaranController extends Controller
{
    public function index(Request $request)
    {
        $defaultStart = now()->startOfMonth()->toDateString();
        $defaultEnd = now()->endOfMonth()->toDateString();

        $startDate = $request->get('startDate', $defaultStart);
        $endDate = $request->get('endDate', $defaultEnd);
        $contact_id = $request->get('contact_id');
        $category_id = $request->get('category_id');

        // Tambahkan relasi hutangPiutang
        $query = Pengeluaran::with(['contact', 'category', 'akun', 'hutangPiutang'])
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->where('user_id', Auth::id());

        if ($contact_id) $query->where('contact_id', $contact_id);
        if ($category_id) $query->where('category_id', $category_id);

        $pengeluarans = $query->orderBy('tanggal', 'desc')->get();

        // Data Grafik
        $chartData = DB::table('pengeluarans')
            ->join('categories', 'pengeluarans.category_id', '=', 'categories.id')
            ->select('categories.nama', DB::raw('SUM(pengeluarans.nominal) as total'))
            ->whereBetween('pengeluarans.tanggal', [$startDate, $endDate])
            ->where('pengeluarans.user_id', Auth::id())
            ->groupBy('categories.nama')
            ->get();

        // Hitung Stats berdasarkan ada tidaknya hutang_piutang_id
        $totalPengeluaran = $pengeluarans->sum('nominal');
        $totalHutang = $pengeluarans->filter(function ($item) {
            return $item->hutang_piutang_id !== null;
        })->sum('nominal');
        $totalLunas = $totalPengeluaran - $totalHutang;

        return Inertia::render('Laporan/Pengeluaran', [
            'pengeluarans' => $pengeluarans,
            'chartData' => $chartData,
            'suppliers' => Contact::whereIn('jenis', ['SUPPLIER', 'BOTH'])->where('user_id', Auth::id())->get(),
            'categories' => Category::where('jenis', 'PENGELUARAN')->where('user_id', Auth::id())->get(),
            'filters' => [
                'startDate' => $startDate,
                'endDate' => $endDate,
                'contact_id' => $contact_id,
                'category_id' => $category_id,
            ],
            'stats' => [
                'totalPengeluaran' => (float)$totalPengeluaran,
                'totalLunas' => (float)$totalLunas,
                'totalHutang' => (float)$totalHutang,
            ]
        ]);
    }
}

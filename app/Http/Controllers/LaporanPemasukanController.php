<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Contact;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class LaporanPemasukanController extends Controller
{
    public function index(Request $request)
    {
        $defaultStart = now()->startOfMonth()->toDateString();
        $defaultEnd = now()->endOfMonth()->toDateString();

        $startDate = $request->get('startDate', $defaultStart);
        $endDate = $request->get('endDate', $defaultEnd);
        $status = $request->get('status');
        $contact_id = $request->get('contact_id');
        $category_id = $request->get('category_id');

        $query = Pemasukan::with(['contact', 'category', 'akun'])
            ->withSum('pengeluaranProject as total_modal', 'nominal') // Hitung otomatis modalnya
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->where('user_id', Auth::id());

        if ($status) $query->where('status', $status);
        if ($contact_id) $query->where('contact_id', $contact_id);
        if ($category_id) $query->where('category_id', $category_id);



        $pemasukans = $query->orderBy('tanggal', 'desc')->get();

        // Hitung total keseluruhan untuk Stats Card
        $totalPemasukan = $pemasukans->sum('nominal');
        $totalModal = $pemasukans->sum('total_modal');
        $profit = $totalPemasukan - $totalModal;

        // Data untuk Grafik Kategori
        $chartData = DB::table('pemasukans')
            ->join('categories', 'pemasukans.category_id', '=', 'categories.id')
            ->select('categories.nama', DB::raw('SUM(pemasukans.nominal) as total'))
            ->whereBetween('pemasukans.tanggal', [$startDate, $endDate])
            ->where('pemasukans.user_id', $request->user()->id)
            ->groupBy('categories.nama')
            ->get();

        return Inertia::render('Laporan/Pemasukan', [
            'pemasukans' => $pemasukans,
            'chartData' => $chartData,
            'contacts' => Contact::whereIn('jenis', ['CUSTOMER', 'BOTH'])
                ->where('user_id', Auth::id()) // Pastikan customer milik user login
                ->get(),
            'categories' => Category::where('jenis', 'PEMASUKAN')
                ->where('user_id', Auth::id()) // Pastikan kategori milik user login
                ->get(),

            // PERBAIKAN DI SINI:
            'filters' => [
                'startDate'   => $startDate,
                'endDate'     => $endDate,
                'status'      => $status,
                'contact_id'  => $contact_id,
                'category_id' => $request->get('category_id'),
            ],

            'stats' => [
                'totalNominal' => $pemasukans->sum('nominal'),
                'totalModal' => $totalModal,
                'totalProfit' => $profit,
                'totalPending' => $pemasukans->where('status', 'PENDING')->sum('nominal'),
                'totalLunas' => $pemasukans->where('status', 'LUNAS')->sum('nominal'),
            ]
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use App\Models\HutangPiutang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DailyCashflowController extends Controller
{
    public function index(Request $request)
    {
        // Default: Awal bulan ini sampai hari ini
        $today = now()->toDateString();
        $startDate = $request->get('startDate', now()->startOfMonth()->toDateString());
        $endDate = $request->get('endDate', $today);

        // 1. Ambil semua tanggal unik yang memiliki transaksi
        // Gunakan Model agar nama tabel otomatis menyesuaikan (safe)
        $q1 = Pemasukan::select('tanggal')->whereBetween('tanggal', [$startDate, $endDate]);
        $q2 = Pengeluaran::select('tanggal')->whereBetween('tanggal', [$startDate, $endDate]);
        $q3 = HutangPiutang::select('tanggal')->whereBetween('tanggal', [$startDate, $endDate]);

        $allDates = $q1->union($q2)->union($q3)
            ->orderBy('tanggal', 'asc')
            ->pluck('tanggal')
            ->unique();

        // 2. Hitung Saldo Awal (Pemasukan Lunas - Pengeluaran Lunas sebelum startDate)
        $pemasukanLalu = Pemasukan::where('tanggal', '<', $startDate)->where('status', 'LUNAS')->sum('nominal');
        $pengeluaranLalu = Pengeluaran::where('tanggal', '<', $startDate)->whereNull('hutang_piutang_id')->sum('nominal');

        $runningBalance = $pemasukanLalu - $pengeluaranLalu;
        $initialBalance = $runningBalance;

        $reports = [];

        foreach ($allDates as $date) {
            $masuk = Pemasukan::where('tanggal', $date)->where('status', 'LUNAS')->sum('nominal');
            $keluar = Pengeluaran::where('tanggal', $date)->whereNull('hutang_piutang_id')->sum('nominal');

            // Logika Hutang & Piutang dari tabel hutang_piutangs
            $piutangBaru = HutangPiutang::where('tanggal', $date)->where('jenis', 'PIUTANG')->sum('nominal');
            $hutangBaru = HutangPiutang::where('tanggal', $date)->where('jenis', 'HUTANG')->sum('nominal');

            // Saldo hari ini = Saldo kemarin + Masuk - Keluar
            $runningBalance += ($masuk - $keluar);

            $reports[] = [
                'tanggal' => $date,
                'pemasukan' => (float)$masuk,
                'pengeluaran' => (float)$keluar,
                'piutang' => (float)$piutangBaru,
                'hutang' => (float)$hutangBaru,
                'saldo_akhir' => (float)$runningBalance,
            ];
        }

        return Inertia::render('Laporan/DailyCashflow', [
            'reports' => array_reverse($reports), // Terbaru di atas
            'filters' => [
                'startDate' => $startDate,
                'endDate' => $endDate,
            ],
            'stats' => [
                'saldoAwal' => $initialBalance,
                'totalPemasukan' => array_sum(array_column($reports, 'pemasukan')),
                'totalPengeluaran' => array_sum(array_column($reports, 'pengeluaran')),
                'saldoAkhir' => $runningBalance
            ]
        ]);
    }
}

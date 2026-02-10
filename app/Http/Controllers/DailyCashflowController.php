<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use App\Models\HutangPiutang;
use App\Models\Akun;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonPeriod;

class DailyCashflowController extends Controller
{
    public function index(Request $request)
    {
        // Default: Awal bulan ini sampai hari ini
        $startDate = $request->get('startDate', now()->startOfMonth()->toDateString());
        $endDate = $request->get('endDate', now()->toDateString());

        // 1. Hitung Saldo Awal (Back-Calculation dari Saldo Realtime Akun)
        // Kita ambil saldo real saat ini, lalu dikurangi transaksi yang terjadi dari StartDate s/d Sekarang
        // agar ketemu saldo posisi pada StartDate.
        $currentSaldo = Akun::sum('saldo');

        // Ambil total transaksi dari StartDate ke Masa Depan (Now)
        $pemasukanFuture = Pemasukan::where('tanggal', '>=', $startDate)->sum('nominal');
        $pengeluaranFuture = Pengeluaran::where('tanggal', '>=', $startDate)->sum('nominal');
        $piutangFuture = HutangPiutang::where('jenis', 'PIUTANG')->where('tanggal', '>=', $startDate)->sum('nominal');
        $hutangFuture = HutangPiutang::where('jenis', 'HUTANG')->where('tanggal', '>=', $startDate)->sum('nominal');

        // Hitung Delta Cash (Perubahan Uang Tunai) dari StartDate sampai Sekarang
        // Rumus: (Total Masuk - Piutang) - (Total Keluar - Hutang)
        // Penjelasan: Pemasukan dikurangi Piutang adalah Uang Cash Masuk. Pengeluaran dikurangi Hutang adalah Uang Cash Keluar.
        $deltaCash = ($pemasukanFuture - $piutangFuture) - ($pengeluaranFuture - $hutangFuture);

        // Saldo Awal = Saldo Sekarang - Perubahan
        $saldoAwal = $currentSaldo - $deltaCash;

        $runningBalance = $saldoAwal;
        $initialBalance = $saldoAwal;

        // 2. Generate Range Tanggal (Agar muncul tiap hari sesuai request)
        $period = CarbonPeriod::create($startDate, $endDate);

        // Pre-fetch data grouped by tanggal untuk efisiensi (mencegah query di dalam loop)
        $dailyPemasukan = Pemasukan::whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('tanggal, SUM(nominal) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        $dailyPengeluaran = Pengeluaran::whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('tanggal, SUM(nominal) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        $dailyPiutang = HutangPiutang::where('jenis', 'PIUTANG')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('tanggal, SUM(nominal) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        $dailyHutang = HutangPiutang::where('jenis', 'HUTANG')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->selectRaw('tanggal, SUM(nominal) as total')
            ->groupBy('tanggal')
            ->pluck('total', 'tanggal');

        $reports = [];

        foreach ($period as $date) {
            $d = $date->toDateString();

            $masuk = $dailyPemasukan[$d] ?? 0;
            $keluar = $dailyPengeluaran[$d] ?? 0;
            $piutang = $dailyPiutang[$d] ?? 0;
            $hutang = $dailyHutang[$d] ?? 0;

            // Hitung Perubahan Saldo Harian
            // Saldo Akhir = Saldo Awal + (Pemasukan Cash) - (Pengeluaran Cash)
            $netChange = ($masuk - $piutang) - ($keluar - $hutang);

            $runningBalance += $netChange;

            $reports[] = [
                'tanggal' => $d,
                'pemasukan' => (float)$masuk,
                'pengeluaran' => (float)$keluar,
                'piutang' => (float)$piutang,
                'hutang' => (float)$hutang,
                'saldo_akhir' => (float)$runningBalance,
            ];
        }

        return Inertia::render('Laporan/DailyCashflow', [
            'reports' => array_reverse($reports), // Tampilkan dari yang terbaru
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

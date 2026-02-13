<?php

namespace App\Http\Controllers;

use App\Models\HutangPiutang;
use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DailyCashflowController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('startDate', date('Y-m-01'));
        $endDate = $request->input('endDate', date('Y-m-d'));

        // 1. Hitung Saldo Awal (Total Pemasukan - Total Pengeluaran sebelum startDate)
        // Menggunakan kolom 'tanggal' (Transaction Date) bukan created_at untuk akurasi laporan
        $totalMasukAwal = Pemasukan::where('tanggal', '<', $startDate)
            ->where('status', 'LUNAS')
            ->sum('nominal');

        $totalKeluarAwal = Pengeluaran::where('tanggal', '<', $startDate)
            ->where('status', 'LUNAS')
            ->sum('nominal');

        $saldoAwal = $totalMasukAwal - $totalKeluarAwal;

        // 2. Ambil Data Harian dalam Range
        // Menggunakan groupBy('tanggal') yang aman karena kita select kolom 'tanggal' langsung

        // Pemasukan
        $pemasukans = Pemasukan::select('tanggal', DB::raw('SUM(nominal) as total'))
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->where('status', 'LUNAS')
            ->groupBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        // Pengeluaran
        $pengeluarans = Pengeluaran::select('tanggal', DB::raw('SUM(nominal) as total'))
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->where('status', 'LUNAS')
            ->groupBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        // Hutang Baru (Informational)
        $hutangs = HutangPiutang::select('tanggal', DB::raw('SUM(nominal) as total'))
            ->where('jenis', 'HUTANG')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->groupBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        // Piutang Baru (Informational)
        $piutangs = HutangPiutang::select('tanggal', DB::raw('SUM(nominal) as total'))
            ->where('jenis', 'PIUTANG')
            ->whereBetween('tanggal', [$startDate, $endDate])
            ->groupBy('tanggal')
            ->get()
            ->keyBy('tanggal');

        // 3. Merge Data per Tanggal
        $period = \Carbon\CarbonPeriod::create($startDate, $endDate);
        $reports = [];
        $currentSaldo = $saldoAwal;

        $totalPemasukanPeriode = 0;
        $totalPengeluaranPeriode = 0;

        foreach ($period as $date) {
            $d = $date->format('Y-m-d');

            $masuk = $pemasukans[$d]->total ?? 0;
            $keluar = $pengeluarans[$d]->total ?? 0;
            $hutang = $hutangs[$d]->total ?? 0;
            $piutang = $piutangs[$d]->total ?? 0;

            $currentSaldo += ($masuk - $keluar);
            $totalPemasukanPeriode += $masuk;
            $totalPengeluaranPeriode += $keluar;

            $reports[] = [
                'tanggal' => $d,
                'pemasukan' => $masuk,
                'pengeluaran' => $keluar,
                'hutang' => $hutang,
                'piutang' => $piutang,
                'saldo_akhir' => $currentSaldo
            ];
        }

        // Urutkan dari yang terbaru untuk tampilan tabel (opsional, tapi umum)
        $reports = array_reverse($reports);

        return Inertia::render('Laporan/DailyCashflow', [
            'reports' => $reports,
            'stats' => [
                'saldoAwal' => $saldoAwal,
                'totalPemasukan' => $totalPemasukanPeriode,
                'totalPengeluaran' => $totalPengeluaranPeriode,
                'saldoAkhir' => $currentSaldo
            ],
            'filters' => [
                'startDate' => $startDate,
                'endDate' => $endDate
            ]
        ]);
    }
}

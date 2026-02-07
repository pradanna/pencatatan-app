<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\HutangPiutang;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        // 1. Rincian Akun
        $daftarAkun = Akun::where('user_id', $userId)->get();
        // Tambahkan (float) agar dibaca angka
        $totalSaldoAkun = (float) $daftarAkun->sum('saldo');

        // 2. Rincian Hutang
        $hutangAktif = (float) HutangPiutang::where('user_id', $userId)
            ->where('jenis', 'HUTANG')
            ->where('status', 'TAGIHAN_OPEN')
            ->sum('nominal');

        $hutangEstimasi = (float) HutangPiutang::where('user_id', $userId)
            ->where('jenis', 'HUTANG')
            ->where('status', 'ESTIMASI')
            ->sum('nominal');

        $totalHutang = $hutangAktif + $hutangEstimasi;

        // 3. Rincian Piutang
        $piutangAktif = (float) HutangPiutang::where('user_id', $userId)
            ->where('jenis', 'PIUTANG')
            ->where('status', 'TAGIHAN_OPEN')
            ->sum('nominal');

        $piutangEstimasi = (float) HutangPiutang::where('user_id', $userId)
            ->where('jenis', 'PIUTANG')
            ->where('status', 'ESTIMASI')
            ->sum('nominal');

        $totalPiutang = $piutangAktif + $piutangEstimasi;

        // 4. Stock Barang
        // Query DB::raw sering mengembalikan string, jadi WAJIB di-cast ke (float) atau (int)
        $totalAsetBarang = (float) (Stock::where('user_id', $userId)
            ->select(DB::raw('SUM(qty * harga_jual_default) as total_value'))
            ->value('total_value') ?? 0);

        // --- RUMUS ---
        // Karena variabel di atas sudah dipastikan angka (float), rumus di bawah akan benar
        $liquidAssets = $totalSaldoAkun;
        $netCashPosition = ($totalSaldoAkun + $piutangAktif) - $hutangAktif;
        $globalCondition = ($totalSaldoAkun + $totalPiutang + $totalAsetBarang) - $totalHutang;

        return Inertia::render('Dashboard', [
            'rincian' => [
                'daftar_akun' => $daftarAkun,
                'hutang' => [
                    'aktif' => $hutangAktif,
                    'estimasi' => $hutangEstimasi,
                    'total' => $totalHutang
                ],
                'piutang' => [
                    'aktif' => $piutangAktif,
                    'estimasi' => $piutangEstimasi,
                    'total' => $totalPiutang
                ],
                'stock' => $totalAsetBarang,
            ],
            'health' => [
                'liquid' => $liquidAssets,
                'net_cash' => $netCashPosition,
                'global' => $globalCondition
            ]
        ]);
    }
}

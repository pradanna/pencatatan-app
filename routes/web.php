<?php

use App\Http\Controllers\AkunController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DailyCashflowController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PemasukanController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SupplierItemController;
use App\Http\Controllers\HutangPiutangController;
use App\Http\Controllers\LaporanHutangPiutangController;
use App\Http\Controllers\LaporanPemasukanController;
use App\Http\Controllers\LaporanPengeluaranController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard.index');
    }
    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('akuns', AkunController::class);
    Route::resource('contacts', ContactController::class);

    Route::resource('stocks', StockController::class);
    Route::post('/stocks/{stock}/stock-out', [StockController::class, 'stockOut'])->name('stocks.stockOut');
    Route::post('/stocks/{stock}/stock-in', [StockController::class, 'stockIn'])->name('stocks.stockIn');

    Route::resource('supplier-items', SupplierItemController::class);

    Route::resource('pemasukans', PemasukanController::class);

    Route::resource('pengeluarans', PengeluaranController::class);

    Route::resource('categories', CategoryController::class);

    Route::resource('hutang-piutang', HutangPiutangController::class);
    Route::post('hutang-piutang/{hutang_piutang}/pelunasan', [HutangPiutangController::class, 'pelunasan'])->name('hutang-piutang.pelunasan');
    Route::post('hutang-piutang/{hutang_piutang}/convert', [HutangPiutangController::class, 'convertToTagihan'])->name('hutang-piutang.convert');

    Route::get('/daily-cashflow', [DailyCashflowController::class, 'index'])->name('daily-cashflow.index');

    Route::get('/laporan-pemasukan', [LaporanPemasukanController::class, 'index'])->name('laporan-pemasukan.index');
    Route::get('/laporan-pengeluaran', [LaporanPengeluaranController::class, 'index'])->name('laporan-pengeluaran.index');

    Route::get('/laporan-hutang-piutang', [LaporanHutangPiutangController::class, 'index'])
        ->name('laporan-hutang-piutang.index');
    Route::get('/laporan-hutang-piutang/detail/{contact}/{jenis}', [LaporanHutangPiutangController::class, 'getDetail'])->name('laporan-hutang-piutang.detail');
    Route::get('/laporan-hutang-piutang/export/{contact}/{jenis}/{format}', [LaporanHutangPiutangController::class, 'export'])->name('laporan-hutang-piutang.export');
});

require __DIR__ . '/auth.php';

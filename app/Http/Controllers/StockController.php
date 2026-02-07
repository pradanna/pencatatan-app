<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Stock;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index()
    {
        $stocks = Stock::orderBy('nama_barang', 'asc')->get();

        $totalAset = $stocks->sum(function ($stock) {
            return $stock->qty * $stock->harga_modal_avg;
        });
        $histories = StockMutation::with('stock')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Stock/Index', [
            'stocks' => $stocks,
            'totalAset' => $totalAset,
            'akuns' => \App\Models\Akun::orderBy('nama', 'asc')->get(),
            'histories' => $histories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'satuan' => 'required|string|max:50', // Pcs, Unit, Kg
            'qty' => 'required|numeric|min:0',
            'harga_modal_avg' => 'required|numeric|min:0', // Harga Beli
            'harga_jual_default' => 'required|numeric|min:0', // Harga Jual
        ]);

        Stock::create($validated);

        return redirect()->back()->with('message', 'Produk berhasil ditambahkan!');
    }

    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'satuan' => 'required|string|max:50',
            'qty' => 'required|numeric|min:0', // Bisa edit stok manual (Stock Opname)
            'harga_modal_avg' => 'required|numeric|min:0',
            'harga_jual_default' => 'required|numeric|min:0',
        ]);

        $stock->update($validated);

        return redirect()->back()->with('message', 'Data produk diperbarui!');
    }

    public function stockIn(Request $request, Stock $stock)
    {
        $request->validate(['qty_masuk' => 'required|numeric|min:1']);

        DB::transaction(function () use ($request, $stock) {
            $stock->increment('qty', $request->qty_masuk);

            // Catat History
            StockMutation::create([
                'stock_id' => $stock->id,
                'type' => 'IN',
                'qty' => $request->qty_masuk,
                'keterangan' => 'Stok Masuk / Kulakan'
            ]);
        });

        return redirect()->back();
    }

    public function stockOut(Request $request, Stock $stock)
    {
        $request->validate([
            'qty_keluar' => 'required|numeric|min:1|max:' . $stock->qty,
            'akun_id' => 'required|exists:akuns,id', // Untuk mencatat uang masuk ke rekening mana
        ]);

        DB::transaction(function () use ($request, $stock) {
            $totalHarga = $request->qty_keluar * $stock->harga_jual_default;

            // 1. Kurangi Stok
            $stock->decrement('qty', $request->qty_keluar);

            // 2. Catat ke Pemasukan
            Pemasukan::create([
                'akun_id' => $request->akun_id,
                'kategori' => 'Penjualan ' . $stock->nama_barang,
                'nominal' => $totalHarga,
                'tanggal' => now(),
                'keterangan' => "Penjualan {$request->qty_keluar} {$stock->satuan} {$stock->nama_barang}",
            ]);

            StockMutation::create([
                'stock_id' => $stock->id,
                'type' => 'OUT',
                'qty' => $request->qty_keluar,
                'keterangan' => 'Penjualan'
            ]);
            // 3. Tambahkan saldo ke Akun/Kas yang dipilih
            $akun = \App\Models\Akun::find($request->akun_id);
            $akun->increment('saldo', $totalHarga);
        });

        return redirect()->back()->with('message', 'Stok berhasil dikeluarkan dan dicatat sebagai pemasukan.');
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();
        return redirect()->back()->with('message', 'Produk dihapus.');
    }
}

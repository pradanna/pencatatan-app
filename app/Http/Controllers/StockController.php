<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use App\Models\Contact;
use App\Models\HutangPiutang;
use App\Models\Pemasukan;
use App\Models\Stock;
use App\Models\StockMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $stocks = Stock::orderBy('nama_barang')->get();
        $totalAset = $stocks->sum(function ($stock) {
            return $stock->qty * $stock->harga_modal_avg;
        });

        return Inertia::render('Stock/Index', [
            'stocks' => $stocks,
            'totalAset' => $totalAset,
            'akuns' => Akun::all(),
            'histories' => StockMutation::with('stock')->latest()->take(15)->get(),
            // Kirim data contact yang berjenis CUSTOMER atau BOTH untuk pilihan di modal
            'contacts' => Contact::whereIn('jenis', ['CUSTOMER', 'BOTH'])->orderBy('nama')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'qty' => 'required|numeric|min:0',
            'satuan' => 'required|string|max:50',
            'harga_modal_avg' => 'required|numeric|min:0',
            'harga_jual_default' => 'required|numeric|min:0',
        ]);

        Stock::create($validated);

        return redirect()->route('stocks.index')->with('message', 'Produk berhasil ditambahkan.');
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'nama_barang' => 'required|string|max:255',
            'qty' => 'required|numeric|min:0',
            'satuan' => 'required|string|max:50',
            'harga_modal_avg' => 'required|numeric|min:0',
            'harga_jual_default' => 'required|numeric|min:0',
        ]);

        $stock->update($validated);

        return redirect()->route('stocks.index')->with('message', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Stock $stock)
    {
        if ($stock->mutations()->exists()) {
            return redirect()->back()->with('error', 'Produk tidak bisa dihapus karena memiliki riwayat transaksi.');
        }
        $stock->delete();
        return redirect()->route('stocks.index')->with('message', 'Produk berhasil dihapus.');
    }

    /**
     * Proses stok masuk.
     */
    public function stockIn(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'qty_masuk' => 'required|numeric|min:1',
        ]);

        DB::transaction(function () use ($stock, $validated) {
            $stock->increment('qty', $validated['qty_masuk']);
            StockMutation::create([
                'stock_id' => $stock->id,
                'type' => 'IN',
                'qty' => $validated['qty_masuk'],
                'keterangan' => 'Penambahan stok manual.',
            ]);
        });

        return redirect()->route('stocks.index')->with('message', 'Stok berhasil ditambahkan.');
    }

    /**
     * Proses stok keluar dan catat sebagai penjualan (Lunas/Piutang).
     */
    public function stockOut(Request $request, Stock $stock)
    {
        $validated = $request->validate([
            'qty_keluar' => 'required|numeric|min:1|max:' . $stock->qty,
            'contact_id' => 'required|exists:contacts,id',
            'status_pembayaran' => 'required|in:LUNAS,PIUTANG',
            'akun_id' => 'required_if:status_pembayaran,LUNAS|nullable|exists:akuns,id',
            'jatuh_tempo' => 'nullable|date',
        ]);

        $totalPenjualan = $validated['qty_keluar'] * $stock->harga_jual_default;
        $keterangan = "Penjualan {$stock->nama_barang} x {$validated['qty_keluar']}";

        DB::transaction(function () use ($stock, $validated, $totalPenjualan, $keterangan) {
            // 1. Kurangi stok di tabel stocks
            $stock->decrement('qty', $validated['qty_keluar']);

            // 2. Catat mutasi stok
            StockMutation::create([
                'stock_id' => $stock->id,
                'type' => 'OUT',
                'qty' => $validated['qty_keluar'],
                'keterangan' => $keterangan . ' kepada ' . Contact::find($validated['contact_id'])->nama,
            ]);

            // 3. Logika LUNAS atau PIUTANG
            if ($validated['status_pembayaran'] === 'LUNAS') {
                Pemasukan::create([
                    'akun_id' => $validated['akun_id'],
                    'contact_id' => $validated['contact_id'],
                    'nominal' => $totalPenjualan,
                    'tanggal' => now()->toDateString(),
                    'keterangan' => $keterangan,
                    'status' => 'LUNAS',
                ]);
                Akun::find($validated['akun_id'])->increment('saldo', $totalPenjualan);
            } else { // PIUTANG
                HutangPiutang::create([
                    'contact_id' => $validated['contact_id'],
                    'jenis' => 'PIUTANG',
                    'status' => 'TAGIHAN_OPEN',
                    'nominal' => $totalPenjualan,
                    'keterangan' => $keterangan,
                    'tanggal' => now()->toDateString(),
                    'jatuh_tempo' => $validated['jatuh_tempo'] ?? null,
                ]);
            }
        });

        return redirect()->route('stocks.index')->with('message', 'Stok keluar berhasil dicatat sebagai penjualan.');
    }
}

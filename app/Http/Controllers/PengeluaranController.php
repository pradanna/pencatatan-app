<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use App\Models\Akun;
use App\Models\Category;
use App\Models\Contact;
use App\Models\HutangPiutang;
use App\Models\Pemasukan;
use App\Models\SupplierItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PengeluaranController extends Controller
{
    public function index(Request $request)
    {

        $fromDate = $request->from_date ?? now()->format('Y-m-d');
        $toDate = $request->to_date ?? now()->format('Y-m-d');
        $status = $request->status;

        $pengeluarans = Pengeluaran::with(['akun', 'category', 'contact'])
            ->whereBetween('tanggal', [$fromDate, $toDate])
            ->when($status, function ($query, $status) {
                if ($status === 'HUTANG') {
                    return $query->whereNotNull('hutang_piutang_id');
                } elseif ($status === 'LUNAS') {
                    return $query->whereNull('hutang_piutang_id');
                }
            })
            ->orderBy('tanggal', 'desc')
            ->get();

        return Inertia::render('Pengeluaran/Index', [
            'pengeluarans' => $pengeluarans,
            'filters' => [
                'from_date' => $fromDate,
                'to_date' => $toDate,
                'status' => $status,
            ],
            'akuns' => Akun::all(),
            'categories' => Category::where('jenis', 'PENGELUARAN')->get(),
            'suppliers' => Contact::whereIn('jenis', ['SUPPLIER', 'BOTH'])->get(),
            'pemasukans' => Pemasukan::orderBy('tanggal', 'desc')->get(), // Untuk referensi modal proyek
            'supplierItems' => SupplierItem::all(), // Untuk auto-fill harga barang
        ]);
    }

    public function store(Request $request)
    {



        $validated = $request->validate([
            'status' => 'required|in:LUNAS,HUTANG',
            'akun_id' => 'required|exists:akuns,id',
            'category_id' => 'required|exists:categories,id',
            'nominal' => 'required|numeric',
            'tanggal' => 'required|date',
            'keterangan' => 'required',
            'hutang_piutang_id' => 'nullable|exists:hutang_piutangs,id', // Jika ini pelunasan
            'pemasukan_ref_id' => 'nullable|exists:pemasukans,id',
            'contact_id' => $request->status === 'HUTANG' ? 'required|exists:contacts,id' : 'nullable|exists:contacts,id',
        ]);

        DB::transaction(function () use ($request, $validated) {
            $hutangId = null;

            if ($request->status === 'HUTANG') {
                // Buat Hutang Baru
                $hutang = \App\Models\HutangPiutang::create([
                    'contact_id' => $validated['contact_id'],
                    'jenis'      => 'HUTANG',
                    'status'     => 'TAGIHAN_OPEN',
                    'nominal'    => $validated['nominal'],
                    'keterangan' =>  $validated['keterangan'],
                    'jatuh_tempo' => now()->addDays(7),
                ]);
                $hutangId = $hutang->id;
            } else {
                // Jika LUNAS, cek apakah ini melunasi hutang lama?
                $hutangId = $validated['hutang_piutang_id'] ?? null;

                // Jika melunasi hutang lama, update status hutangnya jadi LUNAS
                if ($hutangId) {
                    \App\Models\HutangPiutang::where('id', $hutangId)->update(['status' => 'LUNAS']);
                }

                // Potong Saldo Akun
                \App\Models\Akun::find($validated['akun_id'])->decrement('saldo', $validated['nominal']);
            }

            // Simpan Pengeluaran (Selalu simpan, baik lunas maupun hutang)
            \App\Models\Pengeluaran::create(array_merge(collect($validated)->except(['status'])->toArray(), [
                'hutang_piutang_id' => $hutangId,
            ]));
        });

        return redirect()->back();
    }

    public function destroy(Pengeluaran $pengeluaran)
    {
        DB::transaction(function () use ($pengeluaran) {
            // Kembalikan saldo akun
            Akun::find($pengeluaran->akun_id)->increment('saldo', $pengeluaran->nominal);
            $pengeluaran->delete();
        });

        return redirect()->back();
    }
}

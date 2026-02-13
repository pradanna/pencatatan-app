<?php

namespace App\Http\Controllers;

use App\Models\Pemasukan;
use App\Models\Akun;
use App\Models\Category;
use App\Models\Contact;
use App\Models\HutangPiutang;
use App\Models\SupplierItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class PemasukanController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();

        $startDate = $request->get('startDate', $today);
        $endDate = $request->get('endDate', $today);
        $status = $request->get('status');
        $contact_id = $request->get('contact_id');
        $akun_id = $request->get('akun_id');

        // 1. Inisialisasi Query
        $query = Pemasukan::with(['akun', 'contact', 'category', 'pengeluaranProject']);

        // 2. Terapkan Filter Tanggal
        $query->whereBetween('tanggal', [$startDate, $endDate]);

        // 3. Terapkan Filter Status jika ada
        if ($status) {
            $query->where('status', $status);
        }

        if ($contact_id) {
            $query->where('contact_id', $contact_id);
        }

        if ($akun_id) {
            $query->where('akun_id', $akun_id);
        }

        // 4. EKSEKUSI QUERY (Gunakan variabel $query, jangan panggil Pemasukan:: lagi)
        $pemasukans = $query->orderBy('tanggal', 'desc')->get();

        // Data Master lainnya
        $akuns = Akun::all();
        $contacts_in = Contact::whereIn('jenis', ['CUSTOMER', 'BOTH'])->get();
        $contacts_out = Contact::whereIn('jenis', ['SUPPLIER', 'BOTH'])->get();
        $categories_in = Category::whereIn('jenis', ['PEMASUKAN'])->get();
        $categories_out = Category::whereIn('jenis', ['PENGELUARAN'])->get();

        return Inertia::render('Pemasukan/Index', [
            'pemasukans' => $pemasukans,
            'akuns' => $akuns,
            'contacts_in' => $contacts_in,
            'contacts_out' => $contacts_out,
            'totalPemasukan' => $pemasukans->where('status', 'LUNAS')->sum('nominal'),
            'filters' => [
                'startDate' => $startDate,
                'endDate' => $endDate,
                'status' => $status,
                'contact_id' => $contact_id,
                'akun_id' => $akun_id,
            ],
            'categories_in' => $categories_in,
            'categories_out' => $categories_out,
            'supplierItems' => SupplierItem::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'akun_id' => 'required|exists:akuns,id',
            'contact_id' => 'required|exists:contacts,id',
            'category_id' => 'required|exists:categories,id', // Validasi kategori
            'nominal' => 'required|numeric|min:1',
            'tanggal' => 'required|date',
            'keterangan' => 'required|string|max:255',
            'status' => 'required|in:LUNAS,PIUTANG',
        ]);

        DB::transaction(function () use ($validated) {
            $pemasukan = Pemasukan::create($validated);

            if ($validated['status'] === 'LUNAS') {
                // Tambah saldo akun jika lunas
                Akun::find($validated['akun_id'])->increment('saldo', $validated['nominal']);
            } else {
                // Catat sebagai Piutang (orang lain hutang ke kita)
                HutangPiutang::create([
                    'contact_id' => $validated['contact_id'],
                    'pemasukan_id' => $pemasukan->id, // Hubungkan ke pemasukan ini
                    'category_id' => $pemasukan['category_id'], // Hubungkan ke pemasukan ini
                    'jenis' => 'PIUTANG',
                    'status' => 'TAGIHAN_OPEN',
                    'nominal' => $validated['nominal'],
                    'tanggal' => now(),
                    'keterangan' => $validated['keterangan']
                ]);
            }
        });

        return redirect()->back();
    }

    public function destroy(Pemasukan $pemasukan)
    {
        DB::transaction(function () use ($pemasukan) {
            // Kurangi saldo akun sebelum data dihapus
            $akun = Akun::find($pemasukan->akun_id);
            if ($akun) {
                $akun->decrement('saldo', $pemasukan->nominal);
            }
            $pemasukan->delete();
        });

        return redirect()->back()->with('message', 'Pemasukan dibatalkan.');
    }
}

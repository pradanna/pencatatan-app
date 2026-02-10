<?php

namespace App\Http\Controllers;

use App\Models\HutangPiutang;
use App\Models\Akun;
use App\Models\Contact;
use App\Models\Pemasukan;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HutangPiutangController extends Controller
{
    /**
     * Menampilkan daftar hutang dan piutang
     */
    public function index(Request $request)
    {
        $jenis = $request->input('jenis', 'PIUTANG');
        $contactId = $request->input('contact_id');

        // Hapus 'pemasukan' dan 'pengeluaran' dari with() karena relasi tidak didefinisikan di model
        $query = HutangPiutang::with(['contact'])
            ->where('jenis', $jenis);

        if ($contactId) {
            $query->where('contact_id', $contactId);
        }

        // Filter contacts untuk dropdown filter (sesuai tab)
        $contactTypes = $jenis === 'PIUTANG' ? ['CUSTOMER', 'BOTH'] : ['SUPPLIER', 'BOTH'];
        $contacts = Contact::whereIn('jenis', $contactTypes)->orderBy('nama')->get();

        // Eksekusi query
        $hutangPiutangs = $query->orderBy('status', 'asc')
            ->orderBy('jatuh_tempo', 'asc')
            ->get();

        // Cek manual relasi ke tabel Pemasukan dan Pengeluaran
        // Ambil semua ID dari hasil query
        $hpIds = $hutangPiutangs->pluck('id');

        // Cari ID mana saja yang ada di tabel Pemasukan
        $linkedPemasukan = Pemasukan::whereIn('hutang_piutang_id', $hpIds)
            ->pluck('hutang_piutang_id')
            ->toArray();

        // Cari ID mana saja yang ada di tabel Pengeluaran
        $linkedPengeluaran = Pengeluaran::whereIn('hutang_piutang_id', $hpIds)
            ->pluck('hutang_piutang_id')
            ->toArray();

        // Tambahkan flag 'terhubung_transaksi' ke setiap item
        $hutangPiutangs->transform(function ($item) use ($linkedPemasukan, $linkedPengeluaran) {
            $item->terhubung_transaksi = in_array($item->id, $linkedPemasukan) || in_array($item->id, $linkedPengeluaran);
            return $item;
        });

        return Inertia::render('HutangPiutang/Index', [
            'hutangPiutangs' => $hutangPiutangs,
            'contacts' => $contacts, // Untuk Filter Dropdown
            'allContacts' => Contact::all(), // Untuk Modal Input (Semua Kontak)
            'akuns' => Akun::all(),
            'filters' => $request->only(['jenis', 'contact_id']),
        ]);
    }

    /**
     * Menyimpan data hutang/piutang baru (Status default: ESTIMASI atau TAGIHAN_OPEN)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'jenis' => 'required|in:HUTANG,PIUTANG',
            'status' => 'required|in:ESTIMASI,TAGIHAN_OPEN',
            'nominal' => 'required|numeric|min:1',
            'keterangan' => 'required|string|max:255',
            'jatuh_tempo' => 'nullable|date',
        ]);

        // Tambahkan tanggal hari ini agar muncul di laporan
        HutangPiutang::create($validated + ['tanggal' => now()->toDateString()]);

        return redirect()->back()->with('message', 'Data berhasil dicatat.');
    }

    /**
     * Update data hutang/piutang
     */
    public function update(Request $request, HutangPiutang $hutangPiutang)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'nominal' => 'required|numeric|min:1',
            'keterangan' => 'required|string|max:255',
            'jatuh_tempo' => 'nullable|date',
        ]);

        DB::transaction(function () use ($hutangPiutang, $validated) {
            // Cek apakah data ini terhubung dengan Pemasukan atau Pengeluaran
            // Cari di tabel Pemasukan/Pengeluaran yang punya hutang_piutang_id ini
            $pemasukan = Pemasukan::where('hutang_piutang_id', $hutangPiutang->id)->first();
            $pengeluaran = Pengeluaran::where('hutang_piutang_id', $hutangPiutang->id)->first();

            // Jika terhubung, contact_id tidak boleh berubah (override dengan data lama)
            if (($pemasukan || $pengeluaran) && $hutangPiutang->contact_id != $validated['contact_id']) {
                $validated['contact_id'] = $hutangPiutang->contact_id;
            }

            // Update HutangPiutang
            $hutangPiutang->update($validated);

            // Sinkronisasi Nominal ke Pemasukan jika ada relasi
            if ($pemasukan) {
                $pemasukan->update([
                    'nominal' => $validated['nominal']
                ]);
            }

            // Sinkronisasi Nominal ke Pengeluaran jika ada relasi
            if ($pengeluaran) {
                $pengeluaran->update([
                    'nominal' => $validated['nominal']
                ]);
            }
        });

        return redirect()->back()->with('message', 'Data berhasil diperbarui.');
    }

    /**
     * Mengubah status dari ESTIMASI menjadi TAGIHAN_OPEN
     */
    public function convertToTagihan(HutangPiutang $hutangPiutang)
    {
        $hutangPiutang->update(['status' => 'TAGIHAN_OPEN']);
        return redirect()->back()->with('message', 'Status diperbarui menjadi Tagihan Aktif.');
    }

    /**
     * Logika Utama: Pelunasan
     * Mengubah status menjadi LUNAS dan membuat record di Pemasukan/Pengeluaran
     */
    public function pelunasan(Request $request, HutangPiutang $hutangPiutang)
    {
        $request->validate([
            'akun_id' => 'required|exists:akuns,id',
            'tanggal_bayar' => 'required|date',
        ]);

        if ($hutangPiutang->status === 'LUNAS') {
            return redirect()->back()->with('error', 'Transaksi ini sudah lunas.');
        }

        DB::transaction(function () use ($request, $hutangPiutang) {
            $akun = Akun::find($request->akun_id);

            if ($hutangPiutang->jenis === 'PIUTANG') {
                // 1. Jika Piutang (Orang bayar ke kita) -> Catat di Pemasukan
                Pemasukan::create([
                    'akun_id' => $request->akun_id,
                    'contact_id' => $hutangPiutang->contact_id,
                    'category_id' => null, // Bisa disesuaikan jika ada kategori default pelunasan
                    'nominal' => $hutangPiutang->nominal,
                    'tanggal' => $request->tanggal_bayar,
                    'keterangan' => "Pelunasan Piutang: " . $hutangPiutang->keterangan,
                    'status' => 'LUNAS',
                ]);

                // 2. Tambah Saldo Akun
                $akun->increment('saldo', $hutangPiutang->nominal);
            } else {
                // 1. Jika Hutang (Kita bayar ke orang/supplier) -> Catat di Pengeluaran
                Pengeluaran::create([
                    'akun_id' => $request->akun_id,
                    'contact_id' => $hutangPiutang->contact_id,
                    'hutang_piutang_id' => $hutangPiutang->id,
                    'nominal' => $hutangPiutang->nominal,
                    'tanggal' => $request->tanggal_bayar,
                    'keterangan' => "Pelunasan Hutang: " . $hutangPiutang->keterangan,
                    'status' => 'LUNAS',
                    // Tambahkan kolom lain jika diperlukan sesuai migration pengeluaranmu
                ]);

                // 2. Potong Saldo Akun
                $akun->decrement('saldo', $hutangPiutang->nominal);
            }

            // 3. Update status HutangPiutang menjadi LUNAS
            $hutangPiutang->update(['status' => 'LUNAS']);
        });

        return redirect()->back()->with('message', 'Pelunasan berhasil diproses.');
    }

    /**
     * Menghapus data (Hanya jika belum lunas untuk menjaga integritas saldo)
     */
    public function destroy(HutangPiutang $hutangPiutang)
    {
        if ($hutangPiutang->status === 'LUNAS') {
            return redirect()->back()->with('error', 'Data yang sudah lunas tidak bisa dihapus dari sini. Silakan hapus melalui record transaksi terkait.');
        }

        $hutangPiutang->delete();
        return redirect()->back()->with('message', 'Data berhasil dihapus.');
    }
}

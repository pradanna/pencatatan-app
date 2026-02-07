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
    public function index()
    {
        return Inertia::render('HutangPiutang/Index', [
            'hutangPiutangs' => HutangPiutang::with('contact')
                ->orderBy('status', 'asc') // Menampilkan yang belum lunas di atas
                ->orderBy('jatuh_tempo', 'asc')
                ->get(),
            'contacts' => Contact::all(),
            'akuns' => Akun::all(),
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

        HutangPiutang::create($validated);

        return redirect()->back()->with('message', 'Data berhasil dicatat.');
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

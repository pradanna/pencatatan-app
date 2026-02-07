<?php

namespace App\Http\Controllers;

use App\Models\Akun;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AkunController extends Controller
{
    public function index()
    {
        // Ambil data akun (otomatis difilter punya user login berkat Trait)
        $akuns = Akun::orderBy('nama', 'asc')->get();

        return Inertia::render('Akun/Index', [
            'akuns' => $akuns
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'saldo' => 'required|numeric|min:0',
        ]);

        Akun::create($validated);

        return redirect()->back()->with('message', 'Akun berhasil dibuat!');
    }

    public function update(Request $request, Akun $akun)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'saldo' => 'required|numeric|min:0',
        ]);

        $akun->update($validated);

        return redirect()->back()->with('message', 'Akun berhasil diperbarui!');
    }

    public function destroy(Akun $akun)
    {
        // Opsional: Cek relasi dulu biar aman
        // if ($akun->pemasukans()->exists() || $akun->pengeluarans()->exists()) {
        //     return redirect()->back()->withErrors(['error' => 'Gagal! Akun sudah ada transaksi.']);
        // }

        $akun->delete();

        return redirect()->back()->with('message', 'Akun berhasil dihapus.');
    }
}

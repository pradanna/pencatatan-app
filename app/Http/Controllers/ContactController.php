<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        // Ambil data kontak urut abjad
        $contacts = Contact::orderBy('nama', 'asc')->get();

        return Inertia::render('Contact/Index', [
            'contacts' => $contacts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:CUSTOMER,SUPPLIER,BOTH',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
        ]);

        Contact::create($validated);

        return redirect()->back()->with('message', 'Kontak berhasil disimpan!');
    }

    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:CUSTOMER,SUPPLIER,BOTH',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
        ]);

        $contact->update($validated);

        return redirect()->back()->with('message', 'Data kontak diperbarui!');
    }

    public function destroy(Contact $contact)
    {
        // Opsional: Cek apakah kontak ini punya hutang/piutang sebelum hapus
        // if ($contact->hutangPiutangs()->exists()) { ... }

        $contact->delete();

        return redirect()->back()->with('message', 'Kontak dihapus.');
    }
}

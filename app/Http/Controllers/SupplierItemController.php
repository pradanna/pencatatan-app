<?php

namespace App\Http\Controllers;

use App\Models\SupplierItem;
use App\Models\Contact;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierItemController extends Controller
{
    public function index()
    {
        // Ambil item beserta data suppliernya (Contact)
        $items = SupplierItem::with('contact')->orderBy('nama_barang', 'asc')->get();

        // Ambil data kontak yang jenisnya SUPPLIER atau BOTH untuk dropdown
        $suppliers = Contact::whereIn('jenis', ['SUPPLIER', 'BOTH'])->orderBy('nama', 'asc')->get();

        return Inertia::render('SupplierItem/Index', [
            'items' => $items,
            'suppliers' => $suppliers
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'nama_barang' => 'required|string|max:255',
            'harga_satuan' => 'required|numeric|min:0',
            'satuan' => 'required|string|max:50',
        ]);

        SupplierItem::create($validated);

        return redirect()->back()->with('message', 'Katalog berhasil ditambah!');
    }

    public function update(Request $request, SupplierItem $supplierItem)
    {
        $validated = $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'nama_barang' => 'required|string|max:255',
            'harga_satuan' => 'required|numeric|min:0',
            'satuan' => 'required|string|max:50',
        ]);

        $supplierItem->update($validated);
        return redirect()->back();
    }

    public function destroy(SupplierItem $supplierItem)
    {
        $supplierItem->delete();
        return redirect()->back();
    }
}

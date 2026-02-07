<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        return Inertia::render('Category/Index', [
            'categories' => Category::orderBy('jenis')->orderBy('nama')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:PEMASUKAN,PENGELUARAN',
        ]);

        Category::create($validated);

        return redirect()->back()->with('message', 'Kategori berhasil ditambahkan.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'jenis' => 'required|in:PEMASUKAN,PENGELUARAN',
        ]);

        $category->update($validated);
        return redirect()->back();
    }

    public function destroy(Category $category)
    {
        // Cek dulu apakah kategori sudah dipakai di transaksi agar tidak error relasi
        $category->delete();
        return redirect()->back();
    }
}

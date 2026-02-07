<?php

namespace Database\Seeders;

use App\Models\Akun;
use App\Models\Contact;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = \App\Models\User::factory()->create([
            'name' => 'admin',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('admin123*'),
        ]);

        // 2. Buat Akun Awal
        Akun::create([
            'user_id' => $user->id, // <--- Tambahkan ini manual
            'nama' => 'Cash Toko',
            'saldo' => 0
        ]);

        Akun::create([
            'user_id' => $user->id, // <--- Tambahkan ini manual
            'nama' => 'BCA',
            'saldo' => 0
        ]);

        // 3. Buat Kontak
        Contact::create([
            'user_id' => $user->id, // <--- Tambahkan ini manual
            'nama' => 'Pak Budi (Supplier Kertas)',
            'jenis' => 'SUPPLIER'
        ]);

        Contact::create([
            'user_id' => $user->id, // <--- Tambahkan ini manual
            'nama' => 'Bu Siti (Customer)',
            'jenis' => 'CUSTOMER'
        ]);

        // 4. Buat Stok Dummy
        Stock::create([
            'user_id' => $user->id, // <--- Tambahkan ini manual
            'nama_barang' => 'Kertas A4',
            'qty' => 50,
            'satuan' => 'rim',
            'harga_modal_avg' => 45000,
            'harga_jual_default' => 55000
        ]);
    }
}

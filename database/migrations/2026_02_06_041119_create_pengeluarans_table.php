<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('pengeluarans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('akun_id')->constrained()->cascadeOnDelete(); // Sumber dana

            // Logic Job Costing (Modal Project)
            $table->foreignId('pemasukan_ref_id')->nullable()->constrained('pemasukans')->nullOnDelete();

            // Logic Bayar Hutang
            $table->foreignId('hutang_piutang_id')->nullable()->constrained()->nullOnDelete();

            // Logic Master Barang (Biar tau beli item apa)
            $table->foreignId('supplier_item_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();

            $table->date('tanggal');
            $table->decimal('nominal', 15, 2);
            $table->decimal('qty', 10, 2)->default(1); // Tambahan buat catat jumlah beli
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluarans');
    }
};

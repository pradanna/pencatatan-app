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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('nama_barang');
            $table->decimal('qty', 10, 2)->default(0); // Jumlah saat ini
            $table->string('satuan'); // pcs, unit, kg

            // Harga Beli Rata-rata (Penting buat hitung aset)
            $table->decimal('harga_modal_avg', 15, 2)->default(0);

            // Harga Jual Default (Biar pas input pemasukan otomatis terisi)
            $table->decimal('harga_jual_default', 15, 2)->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};

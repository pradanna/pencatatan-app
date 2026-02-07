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
        Schema::create('pemasukans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('akun_id')->constrained()->cascadeOnDelete(); // Masuk ke akun mana

            // Nullable karena bisa jadi pemasukan tunai tanpa piutang sebelumnya
            $table->foreignId('hutang_piutang_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();

            $table->date('tanggal');
            $table->decimal('nominal', 15, 2);
            $table->text('keterangan')->nullable(); // Nama Project / Sumber Dana
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pemasukans');
    }
};

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
        Schema::table('pemasukans', function (Blueprint $table) {
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['LUNAS', 'PIUTANG'])->default('LUNAS');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pemasukans', function (Blueprint $table) {
            //
        });
    }
};

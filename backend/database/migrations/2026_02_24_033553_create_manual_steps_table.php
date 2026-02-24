<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('manual_steps', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('manual_id');
            $table->unsignedInteger('step_number');
            $table->string('title', 255);
            $table->text('body')->nullable();
            $table->string('image_path', 500)->nullable();
            $table->timestamps();

            $table->index('manual_id', 'idx_manual_id');
            $table->unique(['manual_id', 'step_number'], 'uq_manual_step');
            if (app('db')->getDriverName() === 'mysql') {
            }
            $table->foreign('manual_id')->references('id')->on('manuals');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manual_steps');
    }
};

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
        Schema::create('manual_videos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('manual_id');
            $table->string('file_path', 500);
            $table->string('original_filename', 255)->nullable();
            $table->unsignedInteger('duration')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->enum('processing_status', ['pending','processing','completed','failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->timestamps();

            $table->index('manual_id', 'idx_manual_id');
            $table->index('processing_status', 'idx_processing_status');
            $table->foreign('manual_id')->references('id')->on('manuals');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manual_videos');
    }
};

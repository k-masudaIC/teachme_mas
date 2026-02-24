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
        Schema::create('manuals', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('folder_id')->nullable();
            $table->string('title', 255);
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamp('last_viewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->fullText(['title', 'description'], 'ft_title_description'); // MySQLのみ対応
            $table->index('folder_id', 'idx_folder_id');
            $table->foreign('user_id')->references('id')->on('users');
            // foldersテーブルはPhase2で有効化
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manuals');
    }
};

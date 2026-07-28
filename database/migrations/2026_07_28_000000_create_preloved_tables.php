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
        Schema::create('products', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('price');
            $table->integer('original_price');
            $table->text('description')->nullable();
            $table->string('condition');
            $table->string('brand')->nullable();
            $table->string('category');
            $table->integer('stock')->default(1);
            $table->string('weight')->nullable();
            $table->string('material')->nullable();
            $table->text('tags')->nullable(); // JSON string
            $table->string('status')->default('published');
            $table->text('shopee_link')->nullable();
            $table->text('photos')->nullable(); // JSON string
            $table->text('variants')->nullable(); // JSON string
            $table->timestamps();
        });

        Schema::create('chats', function (Blueprint $table) {
            $table->string('session_id')->primary();
            $table->string('guest_label');
            $table->text('messages')->nullable(); // JSON string
            $table->bigInteger('last_activity');
            $table->integer('unread_by_admin')->default(0);
            $table->timestamps();
        });

        Schema::create('visitors', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'global'
            $table->text('data')->nullable(); // JSON string
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('visitors');
        Schema::dropIfExists('chats');
        Schema::dropIfExists('products');
    }
};

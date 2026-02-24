<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ManualVideoUploadTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    use RefreshDatabase;

    public function test_authenticated_user_can_upload_video()
    {
        // ユーザー作成＆認証
        $user = \App\Models\User::factory()->create();
        $manual = \App\Models\Manual::factory()->create(['user_id' => $user->id]);

        $file = \Illuminate\Http\UploadedFile::fake()->create('test.mp4', 1000, 'video/mp4');

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/manuals/' . $manual->id . '/videos', [
            'video' => $file,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'manual_id', 'file_path', 'original_filename', 'processing_status']);

        $this->assertDatabaseHas('manual_videos', [
            'manual_id' => $manual->id,
            'original_filename' => 'test.mp4',
        ]);
    }
}

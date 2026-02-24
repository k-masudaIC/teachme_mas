<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_login_me_logout_flow()
    {
        // register
        $response = $this->postJson('/api/register', [
            'name' => 'テストユーザー',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);
        $response->assertStatus(201)
            ->assertJsonStructure(['access_token', 'token_type', 'user']);
        $token = $response['access_token'];

        // login
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);
        $response->assertStatus(200)
            ->assertJsonStructure(['access_token', 'token_type', 'user']);
        $token = $response['access_token'];

        // me
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/me');
        $response->assertStatus(200)
            ->assertJson(['email' => 'test@example.com']);

        // logout
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/logout');
        $response->assertStatus(200)
            ->assertJson(['message' => 'ログアウトしました。']);
    }
}

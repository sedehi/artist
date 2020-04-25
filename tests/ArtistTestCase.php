<?php

namespace Sedehi\Artist\Tests;

use Orchestra\Testbench\TestCase;
use Sedehi\Artist\ArtistServiceProvider;

abstract class ArtistTestCase extends TestCase
{
    public function setUp(): void
    {
        parent::setUp();

        $this->app->register(ArtistServiceProvider::class);
    }

    protected function getEnvironmentSetUp($app)
    {
        // Setup default database to use sqlite :memory:
        $app['config']->set('database.default', 'testbench');
        $app['config']->set('database.connections.testbench', [
            'driver'   => 'sqlite',
            'database' => ':memory:',
            'prefix'   => '',
        ]);

        $app['config']->set('app.cipher', 'AES-256-CBC');
        $app['config']->set('app.key', 'base64:qMKhlDk/jnIFnN6Cq8CbGWIycgicAbBf36leTi2pOIs=');
        $app['config']->set('artist.resource_path', 'Artist\Tests\Resources');
    }
}

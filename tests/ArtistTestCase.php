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
}

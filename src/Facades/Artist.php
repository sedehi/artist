<?php

namespace Sedehi\Artist\Facades;

use Illuminate\Support\Facades\Facade;

class Artist extends Facade
{
    /**
     * Get the registered name of the component.
     *
     * @return string
     */
    protected static function getFacadeAccessor()
    {
        return 'artist';
    }
}

<?php
namespace Sedehi\Artist\Http\Controllers;

class IndexController
{
    public function __invoke($section,$resource)
    {
        dd($section,$resource);
    }
}

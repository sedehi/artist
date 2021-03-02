<?php

namespace Sedehi\Artist\Http\Controllers;

class HomeController extends BaseController
{
    public function __invoke()
    {
        return view('artist::home');
    }
}

<?php

namespace Sedehi\Artist\Http\Controllers;

class LogoutController extends BaseController
{
    public function __invoke()
    {
        auth(config('artist.guard'))->logout();

        return redirect()->route('artist.login.form');
    }
}

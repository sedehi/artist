<?php

namespace Sedehi\Artist\Http\Controllers;

use Illuminate\Http\Request;

class LoginController extends BaseController
{
    public function showLoginForm()
    {
        return view('artist::login');
    }

    public function login(Request $request)
    {
        $request->validate(['email' => 'required|email', 'password' => 'required|min:6']);
        $credentials = request()->only(['email', 'password']);
        $login = auth(config('artist.guard'))->attempt($credentials);
        if ($login) {
            request()->session()->regenerate();

            return redirect()->route('artist.home');
        }

        return back()->withInput()->withErrors([
            'email' => trans('auth.failed'),
        ]);
    }
}

<?php

namespace Sedehi\Artist\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Sedehi\Artist\Http\Controllers\ActionController;
use Sedehi\Artist\Http\Controllers\HomeController;
use Sedehi\Artist\Http\Controllers\LogoutController;

class Permission
{
    private $allowed = [
        HomeController::class,
        'Sedehi\Artist\Http\Controllers\UploadController@upload',
        'Sedehi\Artist\Http\Controllers\UploadController@delete',
        'App\Http\Controllers\User\Controllers\Admin\ChangePasswordController@index',
        'App\Http\Controllers\User\Controllers\Admin\ChangePasswordController@change',
        LogoutController::class,
        ActionController::class,
    ];

    public function __construct(Guard $auth)
    {
        $this->auth = $auth;
    }

    public function handle($request, Closure $next)
    {
        if (in_array(Route::currentRouteAction(), $this->allowed)) {
            return $next($request);
        }

        $currentController = explode('\\', strtolower(Route::currentRouteAction()));

        $sectionName = $currentController[3];
        $method = explode('@', end($currentController));
        $controller = reset($method);
        $method = end($method);

        if (Gate::allows($sectionName.'.'.$controller.'.'.$method)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response('Unauthorized.', 403);
        } else {
            return redirect()->route('artist.home')->with('error', trans('auth.access_denied'));
        }
    }
}

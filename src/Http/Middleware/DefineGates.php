<?php

namespace Sedehi\Artist\Http\Middleware;

use Closure;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;

class DefineGates
{
    public function __construct(Guard $auth)
    {
        $this->auth = $auth;
    }

    public function handle($request, Closure $next)
    {
        $this->defineGates();

        return $next($request);
    }

    public function defineGates()
    {
        return true;
        foreach ($this->auth->user()->roles as $userRole) {
            foreach (unserialize($userRole->permission) as $section => $accessData) {
                if (! is_array($accessData)) {
                    Gate::define($section, function ($user) {
                        return true;
                    });
                    continue;
                }

                foreach ($accessData as $controller => $methods) {
                    foreach ($methods as $methodName => $value) {
                        if (Str::contains($methodName, ',')) {
                            foreach (explode(',', $methodName) as $item) {
                                Gate::define($section.'.'.$controller.'.'.$item, function ($user) {
                                    return true;
                                });
                            }
                        } else {
                            Gate::define($section.'.'.$controller.'.'.$methodName, function ($user) {
                                return true;
                            });
                        }
                    }
                }
            }
        }
    }
}

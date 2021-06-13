<?php

namespace Sedehi\Artist;

use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Route;

class ArtistRouteServiceProvider extends ServiceProvider
{
    /**
     * Perform post-registration booting of services.
     *
     * @return void
     */
    public function boot()
    {
        $this->routes(function () {
            $this->mapWebRoutes();
            $this->mapApiRoutes();
            $this->mapAdminRoutes();
        });
    }

    protected function mapAdminRoutes()
    {
        Route::namespace($this->namespace)
            ->middleware('web')
            ->domain(config('artist.domain.admin'))
            ->group(function () {
                if (file_exists(base_path('routes/artist.php'))) {
                    require base_path('routes/artist.php');
                }

                Route::middleware('artist')
                    ->group(function () {
                        $routes = glob(app_path('Http/Controllers/*/routes/admin.php'));
                        foreach ($routes as $route) {
                            require $route;
                        }
                    });
            });
    }

    protected function mapWebRoutes()
    {
        Route::middleware('web')
            ->namespace($this->namespace)
            ->group(function () {
                $routes = glob(app_path('Http/Controllers/*/routes/web.php'));
                foreach ($routes as $route) {
                    require $route;
                }
            });
    }

    protected function mapApiRoutes()
    {
        Route::middleware('api')
            ->namespace($this->namespace)
            ->domain(config('artist.domain.api'))
            ->group(function () {
                $routes = glob(app_path('Http/Controllers/*/routes/api.php'));
                foreach ($routes as $route) {
                    require $route;
                }
            });
    }
}

<?php

namespace Sedehi\Artist;

use Exception;
use Illuminate\Routing\Redirector;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Sedehi\Artist\Http\Middleware\DefineGates;
use Sedehi\Artist\Http\Middleware\Permission;

class ArtistServiceProvider extends ServiceProvider
{
    /**
     * Perform post-registration booting of services.
     *
     * @return void
     */
    public function boot()
    {
        $router = $this->app->make(Router::class);
        $router->pushMiddlewareToGroup('artist', DefineGates::class);
        $router->pushMiddlewareToGroup('artist', Permission::class);

        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'artist');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'artist');
        // $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->app->register(ArtistRouteServiceProvider::class);

        // Publishing is only necessary when using the CLI.
        if ($this->app->runningInConsole()) {
            $this->bootForConsole();
            $this->loadMigration();
        }

        View::addLocation(app_path('Http/Controllers'));

        Redirector::macro('artistRedirect', function () {
            $controller = request()->route()->getAction('controller');
            $controller = explode('@', $controller);
            $action = $controller[1];
            $controller = $controller[0];
            switch ($action) {
                case 'store':
                case 'update':
                case 'destroy':
                    $action = 'index';
                    break;
                default:
                   throw new Exception('wrong method');
            }

            return redirect()->action([$controller, $action]);
        });
    }

    /**
     * Register any package services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(__DIR__.'/../config/artist.php', 'artist');
    }

    /**
     * Get the services provided by the provider.
     *
     * @return array
     */
    public function provides()
    {
        return ['artist'];
    }

    /**
     * Console-specific booting.
     *
     * @return void
     */
    protected function bootForConsole()
    {
        // Publishing the configuration file.
        $this->publishes([
            __DIR__.'/../config/artist.php' => config_path('artist.php'),
        ], 'artist-config');

        // Publishing the views.
        /*$this->publishes([
            __DIR__.'/../resources/views' => base_path('resources/views/vendor/sedehi'),
        ], 'artist.views');*/

        // Publishing assets.
        $this->publishes([
            __DIR__.'/../resources/assets/sleek/dist/assets' => public_path('admin'),
        ], 'artist-assets');

        // Publishing the translation files.
        $this->publishes([
            __DIR__.'/../resources/lang' => resource_path('lang/vendor/sedehi'),
        ], 'artist-lang');

        // Registering package commands.
        // $this->commands([]);
    }

    protected function loadMigration()
    {
        $migratePaths = glob(app_path('Http/Controllers/*/database/migrations'));
        $this->loadMigrationsFrom($migratePaths);
    }
}

<?php

namespace Sedehi\Artist;

use Exception;
use Illuminate\Foundation\AliasLoader;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use Morilog\Jalali\Jalalian;
use Sedehi\Artist\Console\Command\PruneUploadTemporaryCommand;
use Sedehi\Artist\Http\Middleware\Authenticate;
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
        $router->aliasMiddleware('artist-auth', Authenticate::class);
        $router->pushMiddlewareToGroup('artist', 'artist-auth:'.config('artist.guard'));
        $router->pushMiddlewareToGroup('artist', DefineGates::class);
        $router->pushMiddlewareToGroup('artist', Permission::class);

        $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'artist');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'artist');
        // $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->app->register(ArtistRouteServiceProvider::class);
        $loader = AliasLoader::getInstance();
        $loader->alias('Jalalian', Jalalian::class);

        if ($this->app->runningInConsole()) {
            $this->bootForConsole();
            $this->loadMigration();
        }

        View::addLocation(app_path('Http/Controllers'));
        $this->registerMacros();

        Blade::componentNamespace('Sedehi\\Artist\\View\\Components', 'artist');

        $this->commands(PruneUploadTemporaryCommand::class);
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
        $this->publishes([
            __DIR__.'/../resources/views' => base_path('resources/views/vendor/artist'),
        ], 'artist-views');

        // Publishing assets.
        $this->publishes([
            __DIR__.'/../resources/assets/sleek/dist/assets' => public_path('admin'),
        ], 'artist-assets');

        // Publishing the translation files.
        $this->publishes([
            __DIR__.'/../resources/lang' => resource_path('lang/vendor/sedehi'),
        ], 'artist-lang');
    }

    protected function loadMigration()
    {
        $migratePaths = glob(app_path('Http/Controllers/*/database/migrations'));
        $migratePaths = array_merge($migratePaths, [__DIR__.'/../database/migrations']);
        $this->loadMigrationsFrom($migratePaths);
    }

    private function registerMacros()
    {
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

        Request::macro('artistIsResource', function () {
            if (request()->route()->named('artist.resource.*')) {
                return true;
            }

            return false;
        });
    }
}

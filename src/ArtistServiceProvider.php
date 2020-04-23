<?php

namespace Sedehi\Artist;

use Illuminate\Support\ServiceProvider;

class ArtistServiceProvider extends ServiceProvider
{
    /**
     * Perform post-registration booting of services.
     *
     * @return void
     */
    public function boot()
    {
        // $this->loadTranslationsFrom(__DIR__.'/../resources/lang', 'sedehi');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'artist');
        // $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');

        // Publishing is only necessary when using the CLI.
        if ($this->app->runningInConsole()) {
            $this->bootForConsole();
        }
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
        ], 'artist.config');

        // Publishing the views.
        /*$this->publishes([
            __DIR__.'/../resources/views' => base_path('resources/views/vendor/sedehi'),
        ], 'artist.views');*/

        // Publishing assets.
        $this->publishes([
            __DIR__.'/../resources/assets/dist' => public_path('admin'),
        ], 'artist.assets');

        // Publishing the translation files.
        /*$this->publishes([
            __DIR__.'/../resources/lang' => resource_path('lang/vendor/sedehi'),
        ], 'artist.views');*/

        // Registering package commands.
        // $this->commands([]);
    }
}

<?php
use Illuminate\Support\Facades\Route;

Route::group([
    'prefix' => config('artist.path'),
    'namespace' => 'Sedehi\Artist\Http\Controllers'],function(){
    Route::get('index/{section?}/{resource?}','IndexController');
});

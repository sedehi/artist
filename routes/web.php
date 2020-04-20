<?php

use Illuminate\Support\Facades\Route;

Route::group(['prefix' => config('artist.path'), 'namespace' => 'Sedehi\Artist\Http\Controllers'], function () {
    Route::get('index/{section?}/{resource?}', 'IndexController');
    Route::get('create/{section?}/{resource?}', 'CreateController@create');
    Route::post('create/{section?}/{resource?}', 'CreateController@store');
    Route::get('detail/{section?}/{resource?}/{resourceId}', 'DetailController');

});

<?php

use Illuminate\Support\Facades\Route;
use Sedehi\Artist\Http\Controllers\UploadController;

Route::group(['prefix' => config('artist.path'), 'middleware' => ['web', 'artist'], 'namespace' => 'Sedehi\Artist\Http\Controllers'], function () {
    Route::get('/', 'HomeController')->name('artist.home');
    Route::get('/login', 'LoginController@showLoginForm')->name('artist.login.form');
    Route::post('/login', 'LoginController@login')->name('artist.login');
    Route::post('/logout', 'LogoutController')->name('artist.logout');
    Route::get('index/{resource?}', 'IndexController')->name('artist.resource.index');
    Route::get('create/{resource?}', 'CreateController@create')->name('artist.resource.create');
    Route::post('create/{resource?}', 'CreateController@store')->name('artist.resource.store');
    Route::get('edit/{resource?}/{resourceId}', 'EditController@edit')->name('artist.resource.edit');
    Route::match(['PUT', 'PATCH'], 'edit/{resource?}/{resourceId}', 'EditController@update')->name('artist.resource.update');
    Route::get('detail/{resource?}/{resourceId}', 'DetailController')->name('artist.resource.detail');
    Route::delete('destroy/{resource?}', 'DestroyController')->name('artist.resource.destroy');
    Route::post('upload/{resource?}/{resourceId?}', [UploadController::class, 'upload'])->name('artist.resource.upload');
});

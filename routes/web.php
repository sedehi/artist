<?php

use Illuminate\Support\Facades\Route;
use Sedehi\Artist\Http\Controllers\ActionController;
use Sedehi\Artist\Http\Controllers\CreateController;
use Sedehi\Artist\Http\Controllers\DestroyController;
use Sedehi\Artist\Http\Controllers\DetailController;
use Sedehi\Artist\Http\Controllers\EditController;
use Sedehi\Artist\Http\Controllers\HomeController;
use Sedehi\Artist\Http\Controllers\IndexController;
use Sedehi\Artist\Http\Controllers\LoginController;
use Sedehi\Artist\Http\Controllers\LogoutController;
use Sedehi\Artist\Http\Controllers\UploadController;

Route::group(['prefix' => config('artist.path'), 'middleware' => 'web'], function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('artist.login.form');
    Route::post('/login', [LoginController::class, 'login'])->name('artist.login');
    Route::group(['middleware' => 'artist'], function () {
        Route::get('/', HomeController::class)->name('artist.home');
        Route::post('/logout', LogoutController::class)->name('artist.logout');
        Route::get('index/{resource?}', IndexController::class)->name('artist.resource.index');
        Route::get('create/{resource?}', [CreateController::class, 'create'])->name('artist.resource.create');
        Route::post('create/{resource?}', [CreateController::class, 'store'])->name('artist.resource.store');
        Route::get('edit/{resource?}/{resourceId}', [EditController::class, 'edit'])->name('artist.resource.edit');
        Route::match(['PUT', 'PATCH'], 'edit/{resource?}/{resourceId}', [EditController::class, 'update'])->name('artist.resource.update');
        Route::get('detail/{resource?}/{resourceId}', DetailController::class)->name('artist.resource.detail');
        Route::delete('destroy/{resource?}', DestroyController::class)->name('artist.resource.destroy');
        Route::post('upload', [UploadController::class, 'upload'])->name('artist.resource.upload');
        Route::delete('upload', [UploadController::class, 'delete'])->name('artist.resource.upload.delete');
        Route::post('action', ActionController::class)->name('action.dispatch');
    });

});

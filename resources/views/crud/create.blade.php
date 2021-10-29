@php
    $createAction = str_replace('create','store',Route::currentRouteAction());
    $controllerClass = str_replace('@store','',$createAction);
    $createAction = str_replace("App\Http\Controllers\\",'',$createAction);
    $ns = explode('\\',str_replace("@store",'',$createAction));
    $sectionName = $ns[0];
    $controllerName = $ns[3];
@endphp
@extends('artist::layout')
@section('title',trans('artist::artist.create').' '.trans('admin.sections.'.Str::snake($sectionName).'.'.Str::snake($controllerName).'.form'))
@section('content')
    <h4 class="mb-3 page-header">
        {{ trans('artist::artist.create').' '.trans('admin.sections.'.Str::snake($sectionName).'.'.Str::snake($controllerName).'.form') }}
    </h4>
    <div class="row bg-white p-4">
        <div class="col-md-12">
            <form id="submit-form" action="{{ action([$controllerClass,'store'],Route::current()->parameters()) }}" method="post" enctype="multipart/form-data">
                {{ csrf_field() }}
                @include("$sectionName.views.admin.".$controllerClass::$viewForm.".form")
                <button type="submit" class="btn btn-primary" id="submit">@lang('artist::artist.submit')</button>
                <a href="{{ action([$controllerClass,'index'],request()->all()) }}" class="btn btn-warning">@lang('artist::artist.back')</a>
            </form>
        </div>
    </div>
@endsection

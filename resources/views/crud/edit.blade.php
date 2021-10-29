@php
    $editAction = str_replace('edit','update',Route::currentRouteAction());
    $controllerClass = str_replace('@update','',$editAction);
    $editAction = str_replace("App\Http\Controllers\\",'',$editAction);
    $ns = explode('\\',str_replace("@update",'',$editAction));
    $sectionName = $ns[0];
    $controllerName = $ns[3];
@endphp
@extends('artist::layout')
@section('title',trans('artist::artist.edit').' '.trans('admin.sections.'.Str::snake($sectionName).'.'.Str::snake($controllerName).'.form'))
@section('content')
    <h4 class="mb-3 page-header">
        {{ trans('artist::artist.edit').' '.trans('admin.sections.'.Str::snake($sectionName).'.'.Str::snake($controllerName).'.form') }}
    </h4>
    <div class="row bg-white p-4">
        <div class="col-md-12">
            <form id="submit-form" action="{{ action([$controllerClass,'update'],Route::current()->parameters() + request()->query()) }}" method="post" enctype="multipart/form-data">
                {{ csrf_field() }}
                {{ method_field('put') }}
                @include("$sectionName.views.admin.".$controllerClass::$viewForm.".form")
                <button type="submit" class="btn btn-primary">@lang('artist::artist.submit')</button>
                @if(method_exists($controllerClass,'index'))
                    <a href="{{ action([$controllerClass,'index'],request()->all()) }}" class="btn btn-warning">@lang('artist::artist.back')</a>
                @endif
            </form>
        </div>
    </div>

@endsection

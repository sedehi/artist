@php
    $action = Route::currentRouteAction();
    $action = str_replace('@index','',$action);
    $actionClass = $action;
    $action = explode('\\',$action);
    $sectionName = $action[3];
    $controllerName = $action[6];
@endphp
@extends('artist::layout')
@section('content')
    <div class="row">
        @include('artist::crud.search')
        <div class="col-md-12">
            <h4 class="mb-3 page-header">
                @hasSection('title')
                    @yield('title')
                @else
                    {{ trans('admin.sections.'.Str::snake($sectionName).'.'.Str::snake($controllerName).'.index') }}
                @endif
            </h4>
            <div class="card">
                @yield('table_header',View::make('artist::crud.index-table-header',compact([
                    'items',
                    'sectionName',
                    'actionClass',
                    'controllerName'
                ])))
                <table class="table table-hover table-responsive-stack">
                    <thead>
                        <tr>
                            @yield('table_head',View::make('artist::crud.index-table-head'))
                        </tr>
                    </thead>
                    <tbody>
                        @yield('table_body',View::make('artist::crud.index-table-body',compact([
                            'items',
                            'sectionName',
                            'actionClass',
                            'controllerName'
                        ])))
                    </tbody>
                </table>
                <div class="card-footer">
                    @if(
                        $items instanceof \Illuminate\Pagination\Paginator ||
                        $items instanceof Illuminate\Pagination\LengthAwarePaginator
                    )
                        {!! $items->appends(Request::except('page'))->render('artist::pagination.default') !!}
                    @endif
                </div>
            </div>
        </div>
    </div>
    @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.destroy'))
        <form method="POST" action="{{action([$actionClass,'destroy'],[1] + request()->query())}}" id="delete-form">
        @csrf
        @method('delete')
        </form>
    @endif
@endsection

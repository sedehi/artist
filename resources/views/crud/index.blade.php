@php
    $action = Route::currentRouteAction();
    $action = str_replace('@index','',$action);
    $actionClass = $action;
    $action = explode('\\',$action);
    $sectionName = $action[3];
    $controllerName = $action[6];
@endphp
@extends('artist::layout')
@section('title',trans('artist::artist.name'))
@section('content')
    <div class="row">
        @includeIf('artist::section.search')
        <div class="col-md-12">
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

@php
    $controllerClass = head(explode('@',Route::currentRouteAction()));
@endphp
<div class="card-header">
    <div class="row">
        <h5 class="c-grey-900 col-md-6 mt-3">
            <span>@yield('title')</span>
            @include('artist::pagination.pagination-info',$items)
        </h5>
        <div class="col-md-6">
            @if (view()->exists("$sectionName.views.admin.".$controllerClass::$viewForm.".search-form"))
                <button type="button" class="btn btn-primary table-header-btn float-right" data-toggle="collapse" data-target="#searchCollapse" role="button" aria-expanded="false" aria-controls="collapseExample">
                    <i class="fa fa-search"></i>
                </button>
            @endif
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.destroy'))
                <button type="submit" class="btn btn-danger table-header-btn d-none delete-btn float-right mr-1">
                    @lang('admin.delete')
                </button>
            @endif
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.create'))
                <a class="btn btn-success table-header-btn float-right mr-1" href="{!! action([$controllerClass,'create']) !!}">
                    <i class="fa fa-plus"></i>
                </a>
            @endif
        </div>
    </div>
</div>

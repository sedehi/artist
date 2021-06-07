@php
    $controllerClass = head(explode('@',Route::currentRouteAction()));
@endphp
<div class="card-header">
    <div class="row">
        <h4 class="c-grey-900 col-md-6">
            <span>@yield('title')</span>
            @include('vendor.artist.pagination.pagination-info',$items)
        </h4>
        <div class="col-md-6">
            @if (view()->exists("$sectionName.views.admin.".$controllerClass::$viewForm.".search-form"))
                <button type="button" class="btn btn-primary table-header-btn" data-toggle="collapse" data-target="#searchCollapse" role="button" aria-expanded="false" aria-controls="collapseExample">
                    <i class="fa fa-search"></i>
                </button>
            @endif
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.destroy'))
                <button type="submit" class="btn btn-danger table-header-btn d-none delete-btn">
                    @lang('admin.delete')
                </button>
            @endif
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.create'))
                <a class="btn btn-success table-header-btn" href="{!! action([$controllerClass,'create']) !!}">
                    <i class="fa fa-plus"></i>
                </a>
            @endif
        </div>
    </div>
</div>

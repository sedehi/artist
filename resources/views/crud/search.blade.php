@php
    $controllerClass = head(explode('@',Route::currentRouteAction()));
    $sectionName = explode('\\',str_replace("App\Http\Controllers\\",'',$controllerClass))[0];
@endphp

@if(property_exists($controllerClass,'viewForm') && view()->exists("$sectionName.views.admin.".$controllerClass::$viewForm.".search"))
    @include("$sectionName.views.admin.".$controllerClass::$viewForm.".search")
@elseif(view()->exists("$sectionName.views.admin.".$controllerClass::$viewForm.".search-form"))
    <div class="col-md-12 collapse mb-3 @if(count(request()->except('page'))) show @endif" id="searchCollapse">
        <div class="bg-white p-4">
            <button type="button" class="close" aria-label="Close" data-toggle="collapse" data-target="#searchCollapse">
                <span aria-hidden="true">&times;</span>
            </button>
            <h6 class="c-grey-900">@lang('admin.search')</h6>
            <div class="mT-30">
                <form method="get">
                    @if(property_exists($controllerClass,'viewForm'))
                        @includeIf("$sectionName.views.admin.".$controllerClass::$viewForm.".search-form")
                    @endif
                    <button type="submit" class="btn btn-primary">@lang('admin.search')</button>
                    @if (count(request()->except('page')))
                        <a href="{{action([$controllerClass,'index'],Route::current()->parameters())}}" class="btn btn-warning">
                            <span>@lang('admin.all_data')</span>
                        </a>
                    @endif
                </form>
            </div>
        </div>
    </div>
@endif

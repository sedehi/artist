<aside class="navbar navbar-vertical navbar-expand-lg navbar-dark">
    <div class="container-fluid">
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-menu">
            <span class="navbar-toggler-icon"></span>
        </button>
        <h1 class="navbar-brand navbar-brand-autodark">
            <a href="{!! route('artist.home') !!}">@lang('artist::artist.name')</a>
        </h1>
        <div class="collapse navbar-collapse" id="navbar-menu">
            <ul class="navbar-nav pt-lg-3">
                @php
                    $menuResources = glob(app_path('Http/Controllers/*/*Resource.php'));
                @endphp
                @foreach($menuResources as $menuResource)
                    @php
                        $menuResource = \Illuminate\Support\Str::remove('.php',$menuResource);
                        $menuResource = '\\'.\Illuminate\Support\Str::remove('\\',app()->getNamespace()).''.str_replace('/','\\',\Illuminate\Support\Str::after($menuResource,'app'));
                        $resource = new $menuResource;
                        $menuItems = $resource->menu();
                    @endphp

                    @foreach ($menuItems as $menu)
                        {!! $menu->render() !!}
                    @endforeach
                @endforeach
            </ul>
        </div>
    </div>
</aside>

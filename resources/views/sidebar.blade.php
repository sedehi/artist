<aside class="left-sidebar bg-sidebar">
    <div id="sidebar" class="sidebar">
        <div class="app-brand">
            <a href="{!! route('artist.home') !!}">
                <span class="brand-name text-truncate">@lang('artist::artist.name')</span>
            </a>
        </div>
        <div class="sidebar-scrollbar">
            <ul class="nav sidebar-inner" id="sidebar-menu">
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

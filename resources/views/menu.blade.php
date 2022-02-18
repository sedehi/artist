<li class="nav-item @if(!is_null($item->childs)) dropdown @endif @if($item->isActive()) active @endif ">
    <a class="nav-link @if(!is_null($item->childs)) dropdown-toggle @endif" href="@if(!is_null($item->childs)) #{{$item->id}} @else {{$item->url}} @endif" data-bs-toggle="dropdown" data-bs-auto-close="false" role="button" aria-expanded="false" >
        <span class="nav-link-icon d-md-none d-lg-inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" /><line x1="12" y1="12" x2="20" y2="7.5" /><line x1="12" y1="12" x2="12" y2="21" /><line x1="12" y1="12" x2="4" y2="7.5" /><line x1="16" y1="5.25" x2="8" y2="9.75" /></svg>
        </span>
        <span class="nav-link-title">{{$item->title}}</span>
    </a>
    @if(!is_null($item->childs))
        <div class="dropdown-menu">
        <div class="dropdown-menu-columns">
            <div class="dropdown-menu-column">
                @foreach($item->childs as $child)
                    <a class="dropdown-item" href="{{$child->url}}" >
                        {{$child->title}}
                    </a>
                @endforeach
            </div>
        </div>
    </div>
    @endif
</li>

<li  class="@if(!is_null($item->childs)) has-sub @endif @if($item->isActive()) active expand @endif ">
    <a class="sidenav-item-link" @if(!is_null($item->childs)) href="javascript:void(0)" data-toggle="collapse" data-target="#{{$item->id}}" aria-expanded="false" aria-controls="{{$item->id}}" @else href="{{$item->url}} @endif ">
        @if($hasIcon)
            @if(is_null($item->icon))
                <i class="fas fa-minus"></i>
            @else
                <i class="{{$item->icon}}"></i>
            @endif
        @endif
        <span class="nav-text">{{$item->title}}</span> @if(!is_null($item->childs)) <b class="caret"></b> @endif
    </a>
    @if(!is_null($item->childs))
        <ul  class="collapse" id="{{$item->id}}">
            <div class="sub-menu">
                @foreach($item->childs as $child)
                    {!! $child->render(false) !!}
                @endforeach
            </div>
        </ul>
    @endif
</li>

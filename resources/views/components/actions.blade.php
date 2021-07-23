@php
    $resourceClass = new $resource;
    $actions = $resourceClass->actions(request());
@endphp
<div class="dropdown d-inline-block">
    <button class="btn btn-primary dropdown-toggle" type="button" id="actionsMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-display="static">
        @lang('artist::artist.actions.action_button')
    </button>
    <div class="dropdown-menu" aria-labelledby="actionsMenu">
        @foreach($actions as $action)
            <x-artist::action link :model="$model" :action="$action"/>
        @endforeach
    </div>
</div>


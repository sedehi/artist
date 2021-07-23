@php
    $resourceClass = new $resource;
    $actions = $resourceClass->actions(request());
@endphp
@foreach($actions as $action)
    <x-artist::action :model="$model" :action="$action"/>
@endforeach


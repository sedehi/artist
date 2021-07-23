@php
    if(is_object($action)){
        $actionClass = $action;
    }else{
        $actionClass = new $action;
    }
    $action = get_class($actionClass);
    $view = $actionClass->renderView();
    $hasModal = false;
    if(!is_null($view)){
        $hasModal = true;
    }
    $id = \Illuminate\Support\Str::slug($action.$model[$model->getKeyName()])
@endphp
@if($actionClass->getShowOnTableRow())
    <form method="post" action="{{route('action.dispatch')}}" class="d-inline-block">
    @csrf
    <input type="hidden" name="action" value="{{$action}}">
    @if(isset($resource))
        <input type="hidden" name="resource" value="{{$resource}}">
    @endif
    @if(isset($model))
        <input type="hidden" name="primary_key" value="{{$model[$model->getKeyName()]}}">
        <input type="hidden" name="model" value="{{get_class($model)}}">
    @endif
    @if(!$hasModal)
        <button type="submit" @if($actionClass->withConfirmation) onclick="return confirm('{{$actionClass->confirmText}}')" @endif class="@if($attributes->has('link')) dropdown-item @else {{$actionClass->btnClass}} @endif">{{$actionClass->name}}</button>
    @endif
    @if($hasModal)
        <button type="button" data-toggle="modal" data-target="#{{$id}}" class="@if($attributes->has('link')) dropdown-item @else {{$actionClass->btnClass}} @endif">{{$actionClass->name}}</button>
        <div class="modal fade" id="{{$id}}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">{{$actionClass->name}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        {!! $view->render() !!}
                        <input type="hidden" name="modal_id" value="{{$id}}">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">{{$actionClass->cancelButtonText}}</button>
                        <button type="submit" @if($actionClass->withConfirmation) onclick="return confirm('{{$actionClass->confirmText}}')" @endif class="{{$actionClass->btnClass}}">{{$actionClass->confirmButtonText}}</button>
                    </div>
                </div>
            </div>
        </div>
    @endif
</form>
@endif
@push('css')
    <style>
        .modal-backdrop {
            display: none;
        }
    </style>
@endpush

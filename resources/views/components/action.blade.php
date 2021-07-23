@php
    if(is_object($action)){
        $actionClass = $action;
    }else{
        $actionClass = new $action;
    }
    $action = get_class($action);
    $view = $actionClass->renderView();
    $hasModal = false;
    if(!is_null($view)){
        $hasModal = true;
    }
@endphp
@if($actionClass->getShowOnTableRow())
    <form method="post" action="{{route('action.dispatch')}}">
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
        <button type="submit" @if($actionClass->withConfirmation) onclick="return confirm('{{$actionClass->confirmText}}')" @endif class="{{$actionClass->btnClass}}">{{$actionClass->name}}</button>
    @endif
    @if($hasModal)
        <button type="button" data-toggle="modal" data-target="#exampleModal" class="{{$actionClass->btnClass}}">{{$actionClass->name}}</button>
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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

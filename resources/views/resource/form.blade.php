@php
    if (in_array($formMethod,['PUT','PATCH'])) {
        $updateMethod = $formMethod;
        $formMethod = 'POST';
    }
@endphp
<form class="form-horizontal" action="{{$formAction}}" method="{{$formMethod}}" enctype="multipart/form-data">
    @if (isset($updateMethod))
        @method($updateMethod)
    @endif
    @csrf
    <div class="card-body">
        @foreach($resource->fieldsForCreate() as $field)
            <div class="form-group row mb-4">
               {!! $field->model($item ?? null)->render() !!}
            </div>
        @endforeach
</div>
<div class="card-footer">
    <button class="btn btn-md btn-primary" type="submit">Create</button>
    <button class="btn btn-md btn-primary" type="submit">Create and Add Another</button>
    <button class="btn btn-md btn-danger" type="reset"> Reset</button>
</div>
</form>

<div class="card-body">
    @foreach($fields as $field)
        <div class="form-group row mb-4">
            {!! $field->render() !!}
        </div>
    @endforeach
</div>

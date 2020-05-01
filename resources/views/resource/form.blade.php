<div class="card-body">
    @foreach($fields as $field)
        <div class="form-group row mb-4">
            {!! $field->model($item ?? null)->render() !!}
        </div>
    @endforeach
</div>

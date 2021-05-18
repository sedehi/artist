<div class="card-body">
    @foreach($fields as $field)
        @if ($field->type == 'hidden')
            {!! $field->model($item ?? null)->render() !!}
        @else
            <div class="form-group row mb-4">
                {!! $field->model($item ?? null)->render() !!}
            </div>
        @endif
    @endforeach
        <div class="form-group row mb-4">
            <label class="col-md-3 col-form-label">
                salam ss
            </label>
            <div class="col-md-9">
                <input type="file" name="navid" class="files">
            </div>
        </div>
</div>

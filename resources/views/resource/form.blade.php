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
</div>

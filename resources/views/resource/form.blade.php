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
                <input type="file"
                       multiple
                       name="upload-file"
                       class="files"
                       data-server-url="{{route('artist.resource.upload',$resource->name())}}"
                       data-max-file-size="3MB"
                       data-max-files="2"
                       data-max-parallel-uploads="3"
                >
            </div>
        </div>
</div>

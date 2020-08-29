<form class="form-horizontal" action="" method="get">
    <div class="card-body">
        <div class="row">
            @foreach($resource->fieldsForSearch() as $field)
                <div class="form-group col-md-4">
                    {!! $field->model(null)->render() !!}
{{--                    {!! $field !!}--}}
                </div>
            @endforeach
        </div>
    </div>
    <div class="card-footer bg-white border-bottom">
        <button class="btn btn-md btn-primary" type="submit">Search</button>
    </div>
</form>

@extends('artist::layout')
@section('content')
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">Simple Table</div>
            <div class="card-body">
                <table class="table table-responsive-sm table-bordered">
                    <thead>
                    <tr>
                        @foreach($resource->fields() as $field)
                            <th>{{$field->getLabel()}}</th>
                        @endforeach
                    </tr>
                    </thead>
                    <tbody>
                    @foreach($items as $item)
                        <tr>
                            @foreach($resource->fields() as $field)
                                <th>{{ $item->{$field->getname()} }}</th>
                            @endforeach
                        </tr>
                    @endforeach
                    </tbody>
                </table>
                {{$items->appends(request()->except('page'))->render('artist::pagination.default')}}
            </div>
        </div>
    </div>
@endsection

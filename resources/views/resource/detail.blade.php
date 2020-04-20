@extends('artist::layout')
@section('content')
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <div class="row">
                    <div class="col-md-3 offset-md-8">
                        <h4>header</h4>
                    </div>
                    <div class="col-md-1">
                        <a href="{{action([\Sedehi\Artist\Http\Controllers\EditController::class,'edit'],['section' => $section,'resource' => $resourceName,$resourceId => $resourceId])}}" class="btn btn-md btn-info text-white">Edit</a>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <table class="table table-responsive-sm table-bordered">
                        @foreach($resource->fieldsForDetail() as $field)
                        <tr>
                            <td>{{$field->getLabel()}}</td>
                            <td>{{ $item->{$field->getname()} }}</td>
                        </tr>
                        @endforeach
                </table>
            </div>
        </div>
    </div>
@endsection

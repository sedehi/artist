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
                        <a href="{{route('artist.resource.edit',['section' => $section,'resource' => $resourceName,$resourceId => $resourceId])}}" class="btn btn-md btn-info text-white">Edit</a>
                        <form method="post" action="{{route('artist.resource.destroy',['section' => $section,'resource' => $resourceName])}}">
                            @method('delete')
                            @csrf
                            <input type="hidden" name="id[]" value="{{ $resourceId }}">
                            <button class="btn btn-md btn-danger text-white">Delete</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <table class="table table-responsive-sm table-bordered">
                    @foreach($fields as $field)
                        <td>{{ $field->model($item)->displayValue() }}</td>
                    @endforeach
                </table>
            </div>
        </div>
    </div>
@endsection

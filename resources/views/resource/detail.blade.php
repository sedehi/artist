@extends('artist::layout')
@section('content')
        <div class="card card-default">
            <div class="card-header card-header-border-bottom">
                    <div class="col-md-10">
                        <h4 class="w-100 p-3">header</h4>
                    </div>
                    <div class="col-md-2">
                        <a href="{{route('artist.resource.edit',['section' => $section,'resource' => $resourceName,$resourceId => $resourceId])}}" class="btn btn-md btn-info text-white float-left mr-3">Edit</a>

                        <form method="post" action="{{route('artist.resource.destroy',['section' => $section,'resource' => $resourceName])}}">
                            @method('delete')
                            @csrf
                            <input type="hidden" name="id[]" value="{{ $resourceId }}">
                            <button class="btn btn-md btn-danger text-white">Delete</button>
                        </form>
                    </div>
            </div>
            <div class="card-body p-4">
                <table class="table table-striped">
                    @foreach($fields as $field)
                        <td>{{ $field->model($item)->displayValue() }}</td>
                    @endforeach
                </table>
            </div>
        </div>
@endsection

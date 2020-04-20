@extends('artist::layout')
@section('content')
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">Simple Table</div>
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

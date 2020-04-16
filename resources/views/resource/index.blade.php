@extends('artist::layout')
@section('content')
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">Simple Table</div>
            <div class="card-body">
                <table class="table table-responsive-sm">
                    <thead>
                    <tr>
                        @foreach($resource->fields() as $field)
                            <th>{{$field->label}}</th>
                        @endforeach
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>Samppa Nori</td>
                        <td>2012/01/01</td>
                        <td>Member</td>
                        <td><span class="badge badge-success">Active</span></td>
                    </tr>
                    </tbody>
                </table>
                <ul class="pagination justify-content-center">
                    <li class="page-item"><a class="page-link" href="#">Prev</a></li>
                    <li class="page-item active"><a class="page-link" href="#">1</a></li>
                    <li class="page-item"><a class="page-link" href="#">2</a></li>
                    <li class="page-item"><a class="page-link" href="#">3</a></li>
                    <li class="page-item"><a class="page-link" href="#">4</a></li>
                    <li class="page-item"><a class="page-link" href="#">Next</a></li>
                </ul>
            </div>
        </div>
    </div>
@endsection
@push('css')
    <style>
        thead tr {
            border-top: none;
        }
    </style>
@endpush

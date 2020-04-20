@extends('artist::layout')
@section('content')
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header"><strong>Basic Form</strong> Elements</div>
            @include('artist::resource.form')
        </div>
    </div>
@endsection

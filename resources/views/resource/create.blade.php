@extends('artist::layout')
@section('content')
    @foreach($fields  as $panel)
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header"><strong>Basic Form</strong> Elements</div>
            @include('artist::resource.form',['fields' => $panel->getFields()])
        </div>
    </div>
    @endforeach
@endsection

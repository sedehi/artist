@extends('artist::layout')
@section('content')
    @php
        if (in_array($formMethod,['PUT','PATCH'])) {
            $updateMethod = $formMethod;
            $formMethod = 'POST';
        }
    @endphp
    <form class="form-horizontal" action="{{$formAction}}" method="{{$formMethod}}" enctype="multipart/form-data">
        @if (isset($updateMethod))
            @method($updateMethod)
        @endif
        @csrf

        @foreach($panels as $panel)
                <div class="card card-default mb-0">
                    <div class="card-header card-header-border-bottom">
                        <h5>{{$panel->getLabel()}}</h5>
                    </div>
                    @include('artist::resource.form',['fields' => $panel->getFields()])
                </div>
        @endforeach

        <div class="card-footer bg-white border-top-0 border-bottom">
            <button class="btn btn-md btn-primary" type="submit">Create</button>
            <button class="btn btn-md btn-primary" type="submit">Create and Add Another</button>
            <button class="btn btn-md btn-danger" type="reset"> Reset</button>
        </div>
    </form>
@endsection

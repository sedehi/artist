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
            <div class="col-lg-12">
                <div class="card">
                    <div class="card-header"><strong>{{$panel->getLabel()}}</strong></div>
                    @include('artist::resource.form',['fields' => $panel->getFields()])
                </div>

            </div>
        @endforeach

        <div class="card-footer">
            <button class="btn btn-md btn-primary" type="submit">Create</button>
            <button class="btn btn-md btn-primary" type="submit">Create and Add Another</button>
            <button class="btn btn-md btn-danger" type="reset"> Reset</button>
        </div>
    </form>
@endsection

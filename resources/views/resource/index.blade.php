@extends('artist::layout')
@section('content')
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">Simple Table</div>
            <div class="card-body">
                <table class="table table-responsive-sm table-bordered">
                    <thead>
                    <tr>
                        @foreach($resource->fieldsForIndex() as $field)
                            <th>{{$field->getLabel()}}
                                @if($field->getSortable())
                                    @if($field->canSort())
                                        @if($field->isSorting('asc'))
                                            <i class="fas fa-sort-up"></i>
                                        @else
                                            <i class="fas fa-sort-down"></i>
                                        @endif
                                    @else
                                        <i class="fas fa-sort"></i>
                                    @endif
                                @endif
                            </th>
                        @endforeach
                    </tr>
                    </thead>
                    <tbody>
                    @foreach($items as $item)
                        <tr>
                            @foreach($resource->fieldsForIndex() as $field)
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

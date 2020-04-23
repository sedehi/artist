@extends('artist::layout')
@section('content')
    <div class="col-lg-12 collapse" id="collapseSearch">
        <div class="card">
            <div class="card-header"><strong>Search Form</strong></div>
            @include('artist::resource.searchForm')
        </div>
    </div>
    <div class="col-lg-12">
        <div class="card">
            <div class="card-header">
                <div class="row" style="display: contents">
                    <div class="col-md-12">
                        <h5 class="float-right">Title</h5>
                        <button type="button" class="btn btn-danger btn-delete float-left d-none"><i class="fas fa-trash"></i></button>
                        <a class="btn btn-success float-left ml-1 text-white" href="{{ route('artist.resource.create',['resource'=> $resourceName]) }}"><i class="fas fa-plus"></i></a>
                        <a class="btn btn-info float-left ml-1 text-white" data-toggle="collapse" href="#collapseSearch"><i class="fas fa-search"></i></a>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <table class="table table-responsive-sm table-bordered">
                    <thead>
                    <tr>
                        <th style="width: 40px">
                            <div class="form-check">
                                <input class="form-check-input position-static" type="checkbox" id="check-all" value="1">
                            </div>
                        </th>
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
                            <td>
                                <div class="form-check">
                                    <input class="form-check-input position-static delete-item" type="checkbox" value="1">
                                </div>
                            </td>
                            @foreach($resource->fieldsForIndex() as $field)
                                <td>{{ $item->{$field->getname()} }}</td>
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
@push('js')
    <script>

        var deleteBtn = '<button type="button" class="file-input-remove btn btn-sm btn-kv btn-default btn-outline-secondary" title="Remove"{dataKey}>' +
            '<i class="fa fa-trash"></i>' +
            '</button>';
    </script>

@endpush

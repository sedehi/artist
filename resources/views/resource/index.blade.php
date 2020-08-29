@extends('artist::layout')
@section('content')
    <div class="col-lg-12 collapse" id="collapseSearch">
        <div class="card card-default mb-2">
            <div class="card-header"><strong>Search Form</strong></div>
            @include('artist::resource.searchForm')
        </div>
    </div>
    <div class="col-lg-12">
        <div class="card card-default mb-2">
            <div class="card-header card-header-border-bottom">
                <div class="col-md-10">
                    <h4 class="w-100 p-3">Title</h4>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger btn-delete float-left d-none"><i class="fas fa-trash"></i></button>
                    <a class="btn btn-success float-left ml-1 text-white" href="{{ route('artist.resource.create',['resource'=> $resourceName,'section' => $section]) }}"><i class="fas fa-plus"></i></a>
                    <a class="btn btn-info float-left ml-1 text-white" data-toggle="collapse" href="#collapseSearch"><i class="fas fa-search"></i></a>
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
                        @foreach($fields as $field)
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
                            @foreach($fields as $field)
                                <td>{{ $field->model($item)->displayValue() }}</td>
                            @endforeach
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
        </div>
        {{$items->appends(request()->except('page'))->render('artist::pagination.default')}}
    </div>
@endsection
@push('js')
    <script>
        $(document).on('change', '.delete-item , #check-all', function () {
            console.log('navid');
            var btn = $('.delete-btn');
            $(this).closest('table').find('.delete-item:checked').each(function () {
                btn.append('<input type="hidden" name="deleteId[]" value="' + $(this).val() + '">');
            });
        });
        var deleteBtn = '<button type="button" class="file-input-remove btn btn-sm btn-kv btn-default btn-outline-secondary" title="Remove"{dataKey}>' +
            '<i class="fa fa-trash"></i>' +
            '</button>';
    </script>

@endpush

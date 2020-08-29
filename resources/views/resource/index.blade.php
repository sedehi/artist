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
                    <button type="button" class="btn btn-danger btn-delete float-right d-none ml-1"><i class="fas fa-trash"></i></button>
                    <a class="btn btn-success float-right ml-1 text-white" href="{{ route('artist.resource.create',['resource'=> $resourceName,'section' => $section]) }}"><i class="fas fa-plus"></i></a>
                    <a class="btn btn-info float-right ml-1 text-white" data-toggle="collapse" href="#collapseSearch"><i class="fas fa-search"></i></a>
                </div>
            </div>
            <div class="card-body">
                <table class="table table-responsive-sm table-striped table-bordered table-responsive-stack">
                    <thead>
                    <tr>
                        <th class="w-45">
                            <div class="form-check">
                                <input class="form-check-input position-static check-all" type="checkbox" value="1">
                            </div>
                        </th>
                        @foreach($fields as $field)
                            <th class="col">{{$field->getLabel()}}
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
                    @forelse($items as $item)
                        <tr>
                            <td class="w-45">
                                <div class="form-check">
                                    <input class="form-check-input position-static delete-item" type="checkbox" value="{{$item->id}}">
                                </div>
                            </td>
                            @foreach($fields as $field)
                                <td class="col">{{ $field->model($item)->displayValue() }}</td>
                            @endforeach
                        </tr>
                    @empty
                        <tr>
                            <td colspan="20" class="text-center">اطلاعاتی برای نمایش وجود ندارد.</td>
                        </tr>
                    @endforelse
                    </tbody>
                </table>
            </div>
            <form method="POST" action="{{route('artist.resource.destroy', ['section' => $section, 'resource' => $resourceName])}}" class="delete-form">
                @csrf
                @method('delete')
            </form>
        </div>
        {{$items->appends(request()->except('page'))->render('artist::pagination.default')}}
    </div>
@endsection
@push('js')
    <script>

        $('.table-responsive-stack').find("th").each(function (i) {
            $('.table-responsive-stack td:nth-child(' + (i + 1) + ')').prepend('<span class="table-responsive-stack-thead">' + $(this).text() + ':</span> ');
            $('.table-responsive-stack-thead').hide();
        });


        $('.table-responsive-stack').each(function () {
            var thCount = $(this).find("th").length;
            var rowGrow = 100 / thCount + '%';
            $(this).find('.form-check').css('display', 'inline-flex');
            $(this).find("th, td").css('min-width', rowGrow);
        });


        function flexTable() {
            if ($(window).width() < 768) {
                $(".table-responsive-stack").each(function (i) {
                    $(this).find(".table-responsive-stack-thead").show();
                    $(this).find('thead').hide();
                });
            } else {
                $(".table-responsive-stack").each(function (i) {
                    $(this).find(".table-responsive-stack-thead").hide();
                    $(this).find('thead').show();
                });
            }
        }
        flexTable();

        window.onresize = function (event) {
            flexTable();
        };




    </script>

@endpush

@extends('artist::layout')
@section('content')
    <div class="col-lg-12 collapse" id="collapseSearch">
        <div class="card card-default mb-2">
            <div class="card-header card-header-border-bottom">
                <h5>Search Form</h5>
            </div>
            @include('artist::resource.searchForm')
        </div>
    </div>
    <div class="col-lg-12">
        <div class="card card-default mb-2">
            <div class="card-header card-header-border-bottom">
                <div class="col-md-10">
                    <h5 class="w-100 p-3">Title</h5>
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-danger btn-delete float-right d-none ml-1"><i class="fas fa-trash"></i></button>
                    <a class="btn btn-success float-right ml-1 text-white" href="{{ route('artist.resource.create',['resource'=> $resourceName,'section' => $section]) }}"><i class="fas fa-plus"></i></a>
                    @if(count($resource->fieldsForSearch()))
                        <a class="btn btn-info float-right ml-1 text-white" data-toggle="collapse" href="#collapseSearch"><i class="fas fa-search"></i></a>
                    @endif
                </div>
            </div>
            <div class="card-body">
                <table class="table table-striped table-bordered table-responsive-stack">
                    <thead>
                    <tr>
                        <th class="w-45 not-dot">
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
                        <th class="w-260 not-dot text-center">...</th>
                    </tr>
                    </thead>
                    <tbody>
                    @forelse($items as $item)
                        <tr>
                            <td class="w-45 not-dot">
                                <div class="form-check">
                                    <input class="form-check-input position-static delete-item" type="checkbox" value="{{$item->id}}">
                                </div>
                            </td>
                            @foreach($fields as $field)
                                <td class="col">{{ $field->model($item)->displayValue() }}</td>
                            @endforeach
                            <td class="w-260 not-dot">
                                <div class="dropdown d-inline-block mb-1">
                                    <button class="btn btn-outline-primary dropdown-toggle" type="button" id="dropdown-{{$section.'-'.$resourceName}}" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-display="static">
                                        عملیات
                                    </button>
                                    <div class="dropdown-menu" aria-labelledby="dropdown-{{$section.'-'.$resourceName}}">
                                        <a class="dropdown-item" href="{{route('artist.resource.edit',['resource'=> $resourceName,'section' => $section,'resourceId'=>$item->getKey()])}}">ویرایش</a>
                                        <a class="dropdown-item" href="{{route('artist.resource.detail',['resource'=> $resourceName,'section' => $section,'resourceId'=>$item->getKey()])}}">جزئیات</a>
                                    </div>
                                </div>
                            </td>
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

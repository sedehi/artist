@forelse($items as $item)
    <tr>
        <td scope="row">
            <div class="form-check">
                <input type="checkbox" name="deleteId[]" value="{{$item->id}}" class="form-check-input position-static delete-item">
            </div>
        </td>
        <td>{{ $item->title }}</td>
        <td>
            {{ Jalalian::fromCarbon($item->created_at)->format('H:i - Y/m/d') }}
        </td>
        <td>
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.edit'))
                <a href="{!! action([$actionClass,'edit'],$item->id) !!}"><i class="fa fa-pencil-square-o"></i></a>
            @endif
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.show'))
                <a href="{!! action($actionClass.'@'.'show',$item->id) !!}"><i class="fa fa-eye"></i></a>
            @endif
        </td>
    </tr>
@empty
    <tr>
        <td colspan="20" class="text-center">@lang('admin.no_data_to_show')</td>
    </tr>
@endforelse

@forelse($items as $item)
    <tr>
        <td scope="row" class="col">
            <div class="form-check">
                <input type="checkbox" name="deleteId[]" value="{{$item->id}}" class="form-check-input position-static delete-item">
            </div>
        </td class="col">
        <td class="col">{{ $item->title }}</td>
        <td class="col">
            {{ Jalalian::fromCarbon($item->created_at)->format('H:i - Y/m/d') }}
        </td>
        <td class="col">
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.edit'))
                <a class="btn btn-sm btn-outline-info" href="{!! action([$actionClass,'edit'],$item->id) !!}"><i class="fas fa-pencil-alt"></i></a>
            @endif
            @if(Gate::allows(strtolower($sectionName).'.'.strtolower($controllerName).'.show'))
                <a class="btn btn-sm btn-outline-info" href="{!! action($actionClass.'@'.'show',$item->id) !!}"><i class="fas fa-eye"></i></a>
            @endif
        </td>
    </tr>
@empty
    <tr class="col">
        <td colspan="20" class="text-center">@lang('artist::artist.no_data_to_show')</td>
    </tr>
@endforelse

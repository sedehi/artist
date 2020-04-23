<label class="col-md-3 col-form-label" for="{{$data->getName()}}">
    @if (!is_null($data->getLabel()))
        {{ $data->getLabel() }}
    @else
        @lang('validation.attributes.'.$data->getName())
    @endif
</label>
<div class="col-md-9">
    <input class="form-control"
            type="text"
            name="{{ $data->getName() }}"
            @if (\Illuminate\Support\Arr::has($data->getHtmlAttributes(),'id'))
                id="{{ $data->getHtmlAttributes()['id'] }}"
                @php unset($data->htmlAttributes['id']) @endphp
            @else
                id="{{$data->getName()}}"
            @endif
            @foreach ($data->getHtmlAttributes() as $attrKey => $attrValue)
                @if ($attrKey === 'disabled')
                    disabled
                @else
                    "{{ $attrKey }}"="{{ $attrValue }}"
                @endif
            @endforeach
            value="{{ old($data->getName(),isset($model) ? $model->{$data->getName()} : null) }}"
    >
    @if (isset($data->help))
        <span class="help-block">{!! $data->getHelp() !!}</span>
    @endif
</div>

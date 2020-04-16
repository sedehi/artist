<label for="{{ $data->getName() }}">
    @if (!is_null($data->getLabel()))
        {{ $data->getLabel() }}
    @else
        @lang('validation.attributes.'.$data->getName())
    @endif
</label>
<input type="text"
       name="{{ $data->getName() }}"
       @if (count($data->getHtmlAttributes()))
           @foreach ($data->getHtmlAttributes() as $attrKey => $attrValue)
               "{{ $attrKey }}"="{{ $attrValue }}"
           @endforeach
       @endif
>

<input type="{{ $field->type }}"
    @foreach ($field->getHtmlAttributes() as $attrKey => $attrValue)
        {{ $attrKey }}="{{ $attrValue }}"
    @endforeach
    value="{{ $field->value() }}"
>

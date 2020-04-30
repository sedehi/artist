<input
    @foreach ($field->getHtmlAttributes() as $attrKey => $attrValue)
        {{ $attrKey }}="{{ $attrValue }}"
    @endforeach
    value="{{ $field->value() }}"
>

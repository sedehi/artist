@error($field->getName())
    @php $field->appendClass('is-invalid') @endphp
@enderror
<label class="col-md-3 col-form-label" for="{{ $field->getHtmlAttribute('id') }}">
    {{ $field->getLabel() }}
</label>
<div class="col-md-9">
    <textarea
        @foreach ($field->getHtmlAttributes() as $attrKey => $attrValue)
            @if ($attrKey === 'disabled')
                disabled
            @else
                {{ $attrKey }}="{{ $attrValue }}"
            @endif
        @endforeach
    >{{ old($field->getName(),$field->value()) }}</textarea>

    @if (isset($field->help))
        <span class="help-block">{!! $field->getHelp() !!}</span>
    @endif
    @error($field->getName())
        <div class="invalid-feedback">
            {{ $message }}
        </div>
    @enderror
</div>

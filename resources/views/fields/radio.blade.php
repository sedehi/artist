@error($field->getName())
    @php $field->appendClass('is-invalid') @endphp
@enderror
<label class="col-md-3 col-form-label" for="{{ $field->getHtmlAttribute('id') }}">
    {{ $field->getLabel() }}
</label>
<div class="col-md-9">
    @foreach($field->getOptions() as $key => $value)
        <span>{{ $value }}</span>
        <input
            @php
                $htmlAttributes = $field->getHtmlAttributes();
                unset($htmlAttributes['id']);
            @endphp
            @foreach ($htmlAttributes as $attrKey => $attrValue)
                @if ($attrKey === 'disabled')
                    disabled
                @else
                    {{ $attrKey }}="{{ $attrValue }}"
                @endif
            @endforeach
            type="{{ $field->type }}"
            value="{{ $key }}"
            @if(old($field->getName(),$field->databaseValue()) == $key) checked @endif
        >
    @endforeach

    @if (isset($field->help))
        <span class="help-block">{!! $field->getHelp() !!}</span>
    @endif
    @error($field->getName())
        <div class="invalid-feedback">
            {{ $message }}
        </div>
    @enderror
</div>

@error($field->getName())
    @php $field->appendClass('is-invalid') @endphp
@enderror
<label class="col-md-3 col-form-label" for="{{ $field->getHtmlAttribute('id') }}">
    {{ $field->getLabel() }}
</label>
<div class="col-md-9">
    <select
        @foreach ($field->getHtmlAttributes() as $attrKey => $attrValue)
            @if ($attrKey === 'disabled')
                disabled
            @else
                {{ $attrKey }}="{{ $attrValue }}"
            @endif
        @endforeach
    >
        <option>{{ __('artist::artist.select_an_option') }}</option>
        @foreach($field->getOptions() as $key => $value)
            <option value="{{ $key }}"
                    @if (old($field->getName(),$field->databaseValue()) == $key) selected @endif
            >{{ $value }}</option>
        @endforeach
    </select>

    @if (isset($field->help))
        <span class="help-block">{!! $field->getHelp() !!}</span>
    @endif
    @error($field->getName())
        <div class="invalid-feedback">
            {{ $message }}
        </div>
    @enderror
</div>

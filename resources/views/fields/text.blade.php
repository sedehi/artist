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



<label class="col-md-3 col-form-label" for="{{$field->getName()}}">{{$field->getLabel()}}</label>
<div class="col-md-9">
    <input class="form-control" id="{{$field->getName()}}" type="text" name="text-input" placeholder="Text">
    <span class="help-block">This is a help text</span>
</div>

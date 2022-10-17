@php
    $name = $attributes['name'];
    if(isset($field)){
       $attributes = $attributes->merge($field->getHtmlAttributes());
    }
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }
    if(!$attributes->has('class')){
        $attributes = $attributes->merge(['class' => 'form-control']);
    }
    if ($errors->has($name)) {
        $attributes = $attributes->merge(['class' => 'is-invalid']);
    }
    if ($attributes->has('value')) {
        $value = $attributes['value'];
    } elseif (isset($field)) {
        $value = old($name,$field->value());
    } else {
        $value = old($name,optional($model)->{$name});
    }
@endphp

<div class="form-group {{$grid}}">
    <label for="{{$name}}">{{$title}}</label>
    <select {{ $attributes }} name="{{$name}}" id="{{$name}}">
        @foreach($options as $optionKey => $optionValue)
            <option value="{{ $optionKey }}" @if ($value == (string) $optionKey) selected @endif>
                {{ $optionValue }}
            </option>
        @endforeach
    </select>
    @if (isset($field->help))
        <span class="help-block">{!! $field->getHelp() !!}</span>
    @endif
    @error($name)
        <div class="invalid-feedback">
            {{$message}}
        </div>
    @enderror
</div>

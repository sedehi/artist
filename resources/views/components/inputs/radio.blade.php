@php
    $name = $attributes['name'];
    $attributeId = $name;
    if(isset($field)){
        if (\Illuminate\Support\Arr::has($field->getHtmlAttributes(),'id')) {
            $attributeId = $field->getHtmlAttributes()['id'];
        }
        $attributes = $attributes->merge(
            \Illuminate\Support\Arr::except($field->getHtmlAttributes(),'id')
        );
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
    if (isset($field)) {
        $value = old($name,$field->value());
    } else {
        $value = old($name,optional($model)->{$name});
    }
@endphp
<div class="form-group {{$grid}}">
    <label>{{$title}}</label>

    @foreach($options as $optionKey => $optionValue)

        <label for="{{$name}}-radio-{{$loop->iteration}}" class="control outlined control-radio">
            {{ $optionValue }}
            <input type="radio"
                   {{ $attributes }}
                   name="{{$name}}"
                   value="{{ $optionKey }}"
                   id="{{$attributeId}}-radio-{{$loop->iteration}}"
                   @if ($value == $optionKey) checked @endif
            >
            <div class="control-indicator"></div>
        </label>
    @endforeach
    @if (isset($field->help))
        <span class="help-block">{!! $field->getHelp() !!}</span>
    @endif
    @error($name)
        <div class="text-danger">
            {{$message}}
        </div>
    @enderror
</div>

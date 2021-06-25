@php
    $name = $attributes['name'];
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }
    if($attributes->has('checked')){
       $checked = true;
    }
    if($attributes->has('class')){
       $class =  $attributes['class'];
    }
    $value = old($name,isset($model) ? $model->{$name} : null) ?? $value;
@endphp
<div class="form-group {{$grid}}">
    <label for="{{$name}}" class="control outlined control-checkbox">
        {{$title}}
        <input type="checkbox"
               name="{{$name}}"
               id="{{$name}}"
               value="{{ $value }}"
               @if(old($name,isset($model) ? $model->{$name} : null) || $checked) checked @endif
               @if($class) class="{!! $class !!}" @endif
        />
        <div class="control-indicator"></div>
    </label>
</div>

@php
    if(isset($field)){
       $attributes = $attributes->merge($field->getHtmlAttributes());
    }
    $name = $attributes['name'];
    if($attributes->has('type')){
       $type =  $attributes['type'];
    }
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }
    if($attributes->has('class')){
       $class =  $attributes['class'];
    }
    if ($errors->has($name)) {
        $class .= ' is-invalid';
    }
    if($type !== 'password'){
        if (isset($field)) {
            $value = old($name,$field->value());
        } else {
            $value = old($name,isset($model) ? $model[$name] : null);
        }
    }
@endphp
<div class="form-group {{$grid}}">
    <label for="{{$name}}">{{$title}}</label>
    <input {{ $attributes }} type="{{$type}}" name="{{$name}}" id="{{$name}}" class="form-control {{$class}} @error($name) is-invalid @enderror" value="{{ $value }}" />
    @if (isset($field->help))
        <span class="help-block">{!! $field->getHelp() !!}</span>
    @endif
    @error($name)
        <div class="invalid-feedback">
            {{$message}}
        </div>
    @enderror
</div>

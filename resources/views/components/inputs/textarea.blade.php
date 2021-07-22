@php
    $rows = $cols = null ;
    if(isset($field)){
       $attributes = $attributes->merge($field->getHtmlAttributes());
    }
    $name = $attributes['name'];
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }
    if($attributes->has('class')){
       $class =  $attributes['class'];
    }
    if($attributes->has('rows')){
       $rows =  $attributes['rows'];
    }
    if($attributes->has('cols')){
       $cols =  $attributes['cols'];
    }
    if (isset($field)) {
        $value = old($name,$field->value());
    } else {
        $value = old($name,optional($model)->{$name});
    }
@endphp
<div class="form-group {{$grid}}">
    <label for="{{$name}}">{{$title}}</label>
    <textarea {{ $attributes }} rows="{{$rows}}" cols="{{$cols}}" name="{{$name}}" id="{{$name}}" class="form-control {{$class}} @error($name) is-invalid @enderror" >{{ $value }}</textarea>
    @if (isset($field->help))
        <span class="help-block">{!! $field->getHelp() !!}</span>
    @endif
    @error($name)
        <div class="invalid-feedback">
            {{$message}}
        </div>
    @enderror
</div>

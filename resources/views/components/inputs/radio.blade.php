@php
    $name = $attributes['name'];
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }
    if($attributes->has('class')){
       $class =  $attributes['class'];
    }
    $value = old($name,optional($model)->{$name});
@endphp
<div class="form-group {{$grid}}">
    <label>{{$title}}</label>

    @foreach($options as $optionKey => $optionValue)
        <label for="{{$name}}-radio-{{$loop->iteration}}" class="control outlined control-radio">
            {{ $optionValue }}
            <input type="radio"
                   name="{{$name}}"
                   value="{{ $optionKey }}"
                   id="{{$name}}-radio-{{$loop->iteration}}"
                   @if ($value == $optionKey) checked @endif
                   @if($class) class="{!! $class !!}" @endif
            >
            <div class="control-indicator"></div>
        </label>
    @endforeach

    @error($name)
        <div class="text-danger">
            {{$message}}
        </div>
    @enderror
</div>

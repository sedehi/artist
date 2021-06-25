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
    $value = old($name,isset($model) ? $model->{$name} : null);
@endphp
<div class="form-group {{$grid}}">
    <label for="{{$name}}">{{$title}}</label>
    <select name="{{$name}}" id="{{$name}}" class="form-control {{$class}} @error($name) is-invalid @enderror">
        @foreach($options as $optionKey => $optionValue)
            <option value="{{ $optionKey }}" @if ($value == $optionKey) selected @endif>
                {{ $optionValue }}
            </option>
        @endforeach
    </select>
    @error($name)
        <div class="invalid-feedback">
            {{$message}}
        </div>
    @enderror
</div>

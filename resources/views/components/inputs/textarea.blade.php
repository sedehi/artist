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
    if($type !== 'password'){
        $value =old($name,isset($model) ? $model[$name] : null);
    }
@endphp
<div class="form-group {{$grid}}">
    <label for="{{$name}}">{{$title}}</label>
    <textarea name="{{$name}}" id="{{$name}}" class="form-control {{$class}} @error($name) is-invalid @enderror" >{{ $value }}</textarea>
    @error($name)
        <div class="invalid-feedback">
            {{$message}}
        </div>
    @enderror
</div>

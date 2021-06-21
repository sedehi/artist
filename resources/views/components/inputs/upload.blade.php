@php
    $name = $attributes['name'];
    $multiple = '';
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }

    if($attributes->has('class')){
       $class =  $attributes['class'];
    }

    if($attributes->has('multiple')){
       $multiple = 'multiple';
    }
@endphp
<div class="{{$grid}} row d-block">
    <input {{$multiple}} data-server-url="{{route('artist.resource.upload')}}" type="file" name="files" id="{{$name}}"  class="files {{$class}}">
    @error($name)
    <div class="invalid-feedback">
        {{$message}}
    </div>
    @enderror
</div>

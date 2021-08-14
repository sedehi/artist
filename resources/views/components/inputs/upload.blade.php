@php
    $originalName = $attributes['name'];
    $name = str_replace('[]','',$originalName);
    $fieldName = $name;
    $multiple = false;
    $required = null;
    $options = null;
    $items = [];
    if($attributes->has('options')){
        $options = $attributes['options'];
    }
    $old = old($name);
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }
    if($attributes->has('class')){
       $class =  $attributes['class'];
    }
    if($attributes->has('field')){
       $fieldName =  $attributes['field'];
    }

    if($attributes->has('required')){
       $required =  'required=true';
    }

    if($attributes->has('model')){
       $model =  $attributes['model'];
    }
    if($attributes->has('multiple')){
       $multiple = 'multiple';
    }


    if(!is_null($model)){
        if ($multiple){
            if($model instanceof \Illuminate\Database\Eloquent\Collection){
                $models = $model;
            }else{
                $models = [$model];
            }
            foreach ($models as $model){
                 if(!is_null(\Illuminate\Support\Arr::get($model,$fieldName)) && Storage::disk($model->disk)->exists($model->getFullPath($fieldName))){
                     $items = [artist_make_upload_items($model,$fieldName)];
                 }
            }
        }else{
           if(!is_null(\Illuminate\Support\Arr::get($model,$fieldName)) && Storage::disk($model->disk)->exists($model->getFullPath($fieldName))){
                $items = [artist_make_upload_items($model,$fieldName)];
           }
        }
    }
    if($old){
        if(!is_array($old)){
            $old = [$old];
        }
        $models = \Sedehi\Artist\Models\UploadTemporary::whereIn('id',$old)->get();
        if(!$models->isEmpty()){
            foreach ($models as $model){
                $items = [
                    $items[] = [
                    'source' => $model->id,
                        'options' => [
                            'type' => 'local',
                            'file' => [
                                'name' => $model->name,
                                'type' =>  \Illuminate\Support\Facades\File::mimeType($model->fullPath),
                                'size' => \Illuminate\Support\Facades\File::size($model->fullPath)
                            ],
                            ]
                        ]
                    ];
            }
        }

    }

@endphp
<div class="form-group {{$grid}} d-block">
    <label for="{{$name}}">{{$title}}</label>
    <input {{$multiple}} {{$required}} data-files='{!! json_encode($items) !!}' data-options="{{$options}}" data-server-url="{{route('artist.resource.upload')}}"  type="file" data-name="{{$originalName}}" name="file" id="{{$name}}"  class="files {{$class}}">
    @error($name)
    <div class="invalid-feedback">
        {{$message}}
    </div>
    @enderror
</div>
@if(isset($old) && count($old))
    @foreach($items as $item)
        <input type="hidden" id="upload-{{$item['source']}}" name="{{$originalName}}" value="{{$item['source']}}">
    @endforeach
@endif




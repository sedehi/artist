@php
    $name = $attributes['name'];
    $multiple = false;
    $items = [];
    if($attributes->has('title')){
       $title =  $attributes['title'];
    }else{
        $title = trans('validation.attributes.'.$name);
    }

    if($attributes->has('class')){
       $class =  $attributes['class'];
    }

    if($attributes->has('model')){
       $model =  $attributes['model'];
    }
    if($attributes->has('multiple')){
       $multiple = 'multiple';
    }
    if(!is_null($model)){
        if ($multiple){

        }else{
            if(!is_null($model->{$name}) && Storage::disk($model->disk)->exists($model->getFullPath($name))){
            $items = [
                    [
                    'source' => $model->id,
                    'options' => [
                        'type' => 'local',
                        'file' => [
                            'name' => $model->{$name},
                            'type' =>  Storage::disk($model->disk)->mimeType($model->getFullPath($name)),
                            'size' => Storage::disk($model->disk)->size($model->getFullPath($name))
                        ],
                         'metadata'=> [
                                    'poster'=> Storage::disk($model->disk)->url($model->getFullPath($name))
                        ]
                    ]
                ]
            ];
            }
        }
    }
    if(old($name)){
        $model = \Sedehi\Artist\Models\UploadTemporary::where('id',old($name))->first();
        if(!is_null($model)){
            $items = [
            [
            'source' => old($name),
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

@endphp
<div class="{{$grid}} row d-block">
    <input {{$multiple}} data-files='{!! json_encode($items) !!}' data-server-url="{{route('artist.resource.upload')}}"  type="file" data-name="{{$name}}" name="file" id="{{$name}}"  class="files {{$class}}">
    @error($name)
    <div class="invalid-feedback">
        {{$message}}
    </div>
    @enderror
</div>

@foreach($items as $item)
    <input type="hidden" id="upload-{{$item['source']}}" name="{{$name}}" value="{{$item['source']}}">
@endforeach

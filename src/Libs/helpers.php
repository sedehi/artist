<?php

use Illuminate\Support\Arr;

if (! function_exists('artist_make_upload_items')) {
    function artist_make_upload_items($item, $options, $optionsMethodName)
    {
        return [
            'source' => $item->id,
            'options' => [
                'type' => 'local',
                'file' => [
                    'name' => Arr::get($item, $options->field),
                    'type' =>  Storage::disk($options->disk)->mimeType($item->getFullPath($optionsMethodName)),
                    'size' => Storage::disk($options->disk)->size($item->getFullPath($optionsMethodName)),
                ],
                'metadata'=> [
                    'poster'=> Storage::disk($options->disk)->url($item->getFullPath($optionsMethodName)),
                ],
            ],
        ];
    }
}

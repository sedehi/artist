<?php

use Illuminate\Support\Arr;

if (! function_exists('artist_make_upload_items')) {
    function artist_make_upload_items($item, $fieldName, $optionsMethodName)
    {
        return [
            'source' => $item->id,
            'options' => [
                'type' => 'local',
                'file' => [
                    'name' => Arr::get($item, $fieldName),
                    'type' =>  Storage::disk($item->disk)->mimeType($item->getFullPath($optionsMethodName)),
                    'size' => Storage::disk($item->disk)->size($item->getFullPath($optionsMethodName)),
                ],
                'metadata'=> [
                    'poster'=> Storage::disk($item->disk)->url($item->getFullPath($optionsMethodName)),
                ],
            ],
        ];
    }
}

<?php

if (! function_exists('artist_make_upload_items')) {
    function artist_make_upload_items($item, $name)
    {
        return [
            'source' => $item->id,
            'options' => [
                'type' => 'local',
                'file' => [
                    'name' => $item->{$name},
                    'type' =>  Storage::disk($item->disk)->mimeType($item->getFullPath($name)),
                    'size' => Storage::disk($item->disk)->size($item->getFullPath($name)),
                ],
                'metadata'=> [
                    'poster'=> Storage::disk($item->disk)->url($item->getFullPath($name)),
                ],
            ],
        ];
    }
}

<?php

return [
    'path' => 'admin',
    'resource_path' => 'Http\ArtistResource',
    'dir' => 'rtl',
    'guard' => 'artist',
    'domain' => [
        'api' => null,
        'admin' => null,
    ],
    'upload_temporary_path' => storage_path('artist/temp'),
];

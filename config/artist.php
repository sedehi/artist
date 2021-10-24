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
    'upload_temporary_expire_time' => 60 * 6,
    'allow_permissions' => []
];

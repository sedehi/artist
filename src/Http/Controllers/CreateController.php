<?php

namespace Sedehi\Artist\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

class CreateController extends BaseController
{
    public function create($section = null, $resource = null)
    {
        if ($section == null && $resource == null) {
            abort(404);
        }

        if ($resource == null) {
            $resource = $section;
            $section = null;
        }

        $resourceFile = app()->getNamespace().config('artist.resource_path').'\\'.$resource;

        $resource = new $resourceFile;
        $formAction = action([self::class, 'store']);
        $formMethod = 'post';

        return view($resource::$createView, compact('section', 'resource', 'formAction', 'formMethod'));
    }

    public function store()
    {
    }
}

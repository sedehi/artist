<?php

namespace Sedehi\Artist\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

class EditController extends BaseController
{
    public function edit($section, $resource, $resourceId)
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
        $query = $resource::$model::query();
        $item = $query->findOrFail($resourceId);
        $formAction = action([self::class, 'update'], ['resourceId' =>$resourceId]);
        $formMethod = 'PUT';

        return view($resource::$editView, compact('section', 'resource', 'formAction', 'formMethod', 'item'));
    }

    public function update()
    {
    }
}

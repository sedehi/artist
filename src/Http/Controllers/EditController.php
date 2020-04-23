<?php

namespace Sedehi\Artist\Http\Controllers;

class EditController extends BaseController
{
    public function edit($resource, $resourceId)
    {
        $section = request()->query('section');
        if ($section == null && $resource == null) {
            abort(404);
        }

        if ($resource == null) {
            $resource = $section;
            $section = null;
        }
        $formAction = action([self::class, 'update'], ['section' => $section, 'resourceId' =>$resourceId, 'resource' => $resource]);
        $formMethod = 'PUT';

        $resourceFile = $this->getResource($resource, $section);

        $resource = new $resourceFile;
        $query = $resource::$model::query();
        $item = $query->findOrFail($resourceId);

        return view($resource::$editView, compact('section', 'resource', 'formAction', 'formMethod', 'item'));
    }

    public function update($resource, $resourceId)
    {
    }
}

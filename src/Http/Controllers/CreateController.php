<?php

namespace Sedehi\Artist\Http\Controllers;

class CreateController extends BaseController
{
    public function create($resource = null)
    {
        $section = request()->query('section');
        if ($section == null && $resource == null) {
            abort(404);
        }

        if ($resource == null) {
            $resource = $section;
            $section = null;
        }
        $formAction = action([self::class, 'store'], ['section' => $section, 'resource' => $resource]);
        $formMethod = 'post';

        $resourceFile = $this->getResource($resource, $section);

        $resource = new $resourceFile;

        return view($resource::$createView, compact('section', 'resource', 'formAction', 'formMethod'));
    }

    public function store()
    {
    }
}

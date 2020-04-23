<?php

namespace Sedehi\Artist\Http\Controllers;

class IndexController extends BaseController
{
    public function __invoke($resource = null)
    {
        $section = request()->query('section');
        if ($section == null && $resource == null) {
            abort(404);
        }

        if ($resource == null) {
            $resource = $section;
            $section = null;
        }
        $resourceName = $resource;
        $resourceFile = $this->getResource($resource, $section);

        $resource = new $resourceFile;
        $query = $resource::$model::query();
        $items = $query->paginate($resource::$perPage);

        return view($resource::$indexView, compact('section', 'resource', 'items', 'resourceName'));
    }
}

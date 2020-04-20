<?php

namespace Sedehi\Artist\Http\Controllers;

use Illuminate\Routing\Controller as BaseController;

class DetailController extends BaseController
{
    public function __invoke($section, $resourceName, $resourceId)
    {
        if ($section == null && $resourceName == null) {
            abort(404);
        }

        if ($resourceName == null) {
            $resourceName = $section;
            $section = null;
        }

        $resourceFile = app()->getNamespace().config('artist.resource_path').'\\'.$resourceName;

        $resource = new $resourceFile;
        $query = $resource::$model::query();
        $item = $query->findOrFail($resourceId);

        return view($resource::$detailView, compact('section', 'resource', 'item','resourceName','resourceId'));
    }
}

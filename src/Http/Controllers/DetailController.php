<?php

namespace Sedehi\Artist\Http\Controllers;
use Illuminate\Routing\Controller as BaseController;

class DetailController extends BaseController
{
    public function __invoke($section = null, $resource = null,$resourceId)
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
        return view($resource::$detailView, compact('section', 'resource', 'item'));
    }
}

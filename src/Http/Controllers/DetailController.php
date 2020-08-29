<?php

namespace Sedehi\Artist\Http\Controllers;

class DetailController extends BaseController
{
    public function __invoke($resourceName, $resourceId)
    {
        $section = request()->query('section');
        if ($section == null && $resourceName == null) {
            abort(404);
        }

        if ($resourceName == null) {
            $resourceName = $section;
            $section = null;
        }

        $resourceFile = $this->getResource($resourceName, $section);

        $resource = new $resourceFile;

        $query = $resource::$model::query();
        $item = $query->findOrFail($resourceId);

        $resource->resource($item);

        $fields = $this->getFieldsForDetail($resource->fieldsForDetail());

        return view($resource::$detailView, compact('section', 'resource', 'item', 'resourceName', 'resourceId', 'fields'));
    }
}

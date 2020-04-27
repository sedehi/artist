<?php

namespace Sedehi\Artist\Http\Controllers;

use Sedehi\Artist\Http\Requests\DestroyRequest;

class DestroyController extends BaseController
{
    public function __invoke(DestroyRequest $request, $resourceName)
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

        $resource::$model::whereIn('id', $request->only('id'))->get()->each->delete();

        return redirect()->route('artist.resource.index', [
            'resource'  => $resourceName,
            'section'   => $section,
        ]);
    }
}

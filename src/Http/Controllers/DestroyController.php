<?php

namespace Sedehi\Artist\Http\Controllers;

use App\User;
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
        $resource::$model::whereIn(app()->make($resource::$model)->getKeyName(), $request->get('id'))->get()->each->delete();

        return redirect()->route('artist.resource.index', [
            'resource'  => $resourceName,
            'section'   => $section,
        ]);
    }
}

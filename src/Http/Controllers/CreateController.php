<?php

namespace Sedehi\Artist\Http\Controllers;

use Sedehi\Artist\Http\Requests\CreateRequest;

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
        $formAction = route('artist.resource.store', ['section' => $section, 'resource' => $resource]);
        $formMethod = 'post';

        $resourceFile = $this->getResource($resource, $section);

        $resource = new $resourceFile;

        $panels = $this->getPanelsForCreate($resource->fieldsForCreate());

        return view($resource::$createView, compact('section', 'panels', 'formAction', 'formMethod','resource'));
    }

    public function store(CreateRequest $request)
    {
        $resourceClass = $this->getResource();

        $resource = new $resourceClass;

        $resource::$model::forceCreate($request->prepareForStore());

        return redirect()->route('artist.resource.index', [
            $resourceClass::name(),
            'section' => $request->get('section'),
        ]);
    }
}

<?php

namespace Sedehi\Artist\Http\Controllers;

use Sedehi\Artist\Http\Requests\UpdateRequest;

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
        $formAction = route('artist.resource.update', ['section' => $section, 'resourceId' =>$resourceId, 'resource' => $resource]);
        $formMethod = 'PUT';

        $resourceFile = $this->getResource($resource, $section);

        $resource = new $resourceFile;
        $query = $resource::$model::query();
        $item = $query->findOrFail($resourceId);

        $panels = $this->getPanelsForUpdate($resource->fieldsForUpdate(), $item);

        return view($resource::$editView, compact('section', 'panels', 'formAction', 'formMethod', 'item'));
    }

    public function update($resource, $resourceId, UpdateRequest $request)
    {
        $section = $request->get('section');
        $resourceClass = $this->getResource($resource, $section);
        $resource = new $resourceClass;
        $model = $resource::$model::findOrFail($resourceId);

        $fields = $this->getFieldsForUpdate($resource->fieldsForUpdate());

        $fieldNames = array_map(function ($field) {
            return $field->getName();
        }, $fields);

        $model->forceFill($request->only($fieldNames))->save();

        return redirect()->route('artist.resource.index', [
            $resourceClass::name(),
            'section' => $section,
        ]);
    }
}

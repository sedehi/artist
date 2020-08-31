<?php

namespace Sedehi\Artist\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Sedehi\Artist\Traits\FilterFields;
use Sedehi\Artist\Traits\Resource;

class ArtistRequest extends FormRequest
{
    use Resource, FilterFields;

    public function prepareForStore()
    {
        $data = [];

        $resourceClass = $this->getResource();
        $resource = new $resourceClass;

        $fields = $this->getFieldsForCreate($resource->fieldsForCreate());

        foreach ($fields as $field) {
            $data[$field->getColumnName()] = $field->storeValue($this);
        }

        return $data;
    }

    public function prepareForUpdate()
    {
        $data = [];

        $resourceClass = $this->getResource();
        $resource = new $resourceClass;

        $fields = $this->getFieldsForUpdate($resource->fieldsForUpdate());

        foreach ($fields as $field) {
            if ($field->getUpdateWhenEmpty() || $this->filled($field->getName())) {
                $data[$field->getColumnName()] = $field->storeValue($this);
            }
        }

        return $data;
    }
}

<?php

namespace Sedehi\Artist\Http\Requests;

class CreateRequest extends ArtistRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {

        $resourceClass = $this->getResource();
        $rules = [];

        $fields = $this->getFieldsForCreate(
            (new $resourceClass)->fieldsForCreate()
        );

        foreach ($fields as $field) {
            $fieldRules = $field->getCreationRules();
            $rules[$field->getName()] = $fieldRules;
        }

        return $rules;
    }
}

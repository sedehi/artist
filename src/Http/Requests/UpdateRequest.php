<?php

namespace Sedehi\Artist\Http\Requests;

use Illuminate\Support\Str;

class UpdateRequest extends ArtistRequest
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

        $fields = $this->getFieldsForUpdate(
            (new $resourceClass)->fieldsForUpdate()
        );

        foreach ($fields as $field) {
            $fieldRules = $field->getUpdateRules();
            foreach ($fieldRules as $fieldRule) {
                if (is_string($fieldRule) && Str::contains($fieldRule, '{{resourceId}}')) {
                    $arrKey = array_search($fieldRule, $fieldRules);
                    $fieldRules[$arrKey] = str_replace('{{resourceId}}', $this->route()->parameter('resourceId'), $fieldRule);
                }
            }
            $rules[$field->getName()] = $fieldRules;
        }

        return $rules;
    }
}

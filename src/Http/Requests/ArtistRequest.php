<?php

namespace Sedehi\Artist\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArtistRequest extends FormRequest
{
    public function getRules($fields)
    {
        $rules = [];

        foreach ($fields as $field) {
            $fieldRules = $field->getCreationRules();
            foreach ($fieldRules as $fieldRule) {
                if (is_string($fieldRule)) {
//                    dd($this->route()->parameters());
//                    dd($fieldRule);
                }
            }
            $rules[$field->getName()] = $fieldRules;
        }
//        dd($rules);
        return $rules;
    }
}

<?php

namespace Sedehi\Artist\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class ArtistRequest extends FormRequest
{
    public function getRules($fields)
    {
        $rules = [];

        switch ($this->route()->getActionMethod()) {
            case 'store':
                foreach ($fields as $field) {
                    $fieldRules = $field->getCreationRules();
                    $rules[$field->getName()] = $fieldRules;
                }
                break;
            case 'update':
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
                break;
        }

        return $rules;
    }

    public function failedValidation()
    {

    }
}

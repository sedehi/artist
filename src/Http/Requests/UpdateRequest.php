<?php

namespace Sedehi\Artist\Http\Requests;

use Sedehi\Artist\Traits\Resource;

class UpdateRequest extends ArtistRequest
{
    use Resource;

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $resourceClass = $this->getResource();

        $resource = new $resourceClass;

        $fields = $resource->fieldsForUpdate();

        return $this->getRules($fields);
    }
}

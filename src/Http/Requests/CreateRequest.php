<?php

namespace Sedehi\Artist\Http\Requests;

use Sedehi\Artist\Traits\Resource;

class CreateRequest extends ArtistRequest
{
    use Resource;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $resourceClass = $this->getResource();

        $resource = new $resourceClass;

        $fields = $resource->fieldsForCreate();

        return $this->getRules($fields);
    }
}

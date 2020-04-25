<?php

namespace Sedehi\Artist\Http\Requests;

use Sedehi\Artist\Traits\Resource;

class UpdateRequest extends ArtistRequest
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

        return $this->getRules(
            (new $resourceClass)->fieldsForUpdate()
        );
    }
}

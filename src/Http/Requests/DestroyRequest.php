<?php

namespace Sedehi\Artist\Http\Requests;

class DestroyRequest extends ArtistRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'id'    =>  'required|array|min:1',
        ];
    }
}

<?php

namespace Sedehi\Artist\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ArtistRequest extends FormRequest
{
    public function getRules($fields)
    {
        dd($fields);
    }
}

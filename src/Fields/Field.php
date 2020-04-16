<?php

namespace Sedehi\Artist\Fields;

use Sedehi\Artist\Traits\Visibility;

class Field
{
    use Visibility;

    protected $label;
    protected $name;
    protected $htmlAttributes = [];

    public function __call($method, $args)
    {
        if (substr(strtolower($method),0,3) === 'get') {
            return $this->{lcfirst(substr($method,3))};
        }

        $this->{$method} = $args[0];

        return $this;
    }
}

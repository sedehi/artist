<?php

namespace Sedehi\Artist\Fields;

class Field
{
    public $label;
    public $name;
    public $htmlAttributes = [];

    public function __call($method, $args)
    {
        if (substr(strtolower($method),0,3) === 'get') {
            return $this->{lcfirst(substr($method,3))};
        }

        $this->{$method} = $args[0];

        return $this;
    }
}

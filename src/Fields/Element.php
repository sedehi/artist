<?php

namespace Sedehi\Artist\Fields;

class Element
{
    protected $label;
    protected $name;

    public function __call($method, $args)
    {
        if (substr(strtolower($method), 0, 3) === 'get') {
            return $this->{lcfirst(substr($method, 3))};
        }

        $this->{$method} = $args[0];

        return $this;
    }
}

<?php

namespace Sedehi\Artist\Fields;

class Text extends Field
{
    protected $viewPath = 'artist::fields.text';

    public static function make()
    {
        return new self;
    }
}

<?php

namespace Sedehi\Artist\Fields;

class Number extends Field
{
    protected $viewPath = 'artist::fields.text';
    public $type = 'number';

    public static function make()
    {
        return new self;
    }

    public function placeholder($text)
    {
        $this->htmlAttributes['placeholder'] = $text;

        return $this;
    }
}

<?php

namespace Sedehi\Artist\Fields;

class Text extends Field
{
    protected $viewPath = 'artist::fields.text';

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

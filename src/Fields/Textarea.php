<?php

namespace Sedehi\Artist\Fields;

class Textarea extends Field
{
    protected $viewPath = 'artist::fields.textarea';
    public $type = 'textarea';

    public static function make()
    {
        return new self;
    }

    public function placeholder($text)
    {
        $this->htmlAttributes['placeholder'] = $text;

        return $this;
    }

    public function rows($number)
    {
        $this->htmlAttributes['rows'] = $number;

        return $this;
    }
}

<?php

namespace Sedehi\Artist\Fields;

class Text extends Field
{
    private $viewPath = 'text';

    public static function make()
    {
        return new self;
    }

    public function __toString()
    {
        return view('artist::fields.'.$this->viewPath,['data' => $this]);
    }
}

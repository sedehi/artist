<?php

namespace Sedehi\Artist\Fields;

class Hidden extends Field
{
    protected $viewPath = 'artist::fields.hidden';
    public $type = 'hidden';

    protected $showOnIndex = false;
    protected $showOnDetail = false;
    protected $showOnCreate = true;
    protected $showOnUpdate = true;

    public static function make()
    {
        return new self;
    }
}

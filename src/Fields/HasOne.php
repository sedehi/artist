<?php

namespace Sedehi\Artist\Fields;

class HasOne extends Relation
{
    protected $viewPath = 'artist::fields.has-one';
    protected $type = 'relation-has-one';
    public $showInPanel = true;
    protected $showOnIndex = false;
    protected $showOnDetail = false;
    protected $showOnCreate = false;
    protected $showOnUpdate = false;

    public static function make($resourceClass)
    {
        self::$resourceClass = $resourceClass;

        return new self;
    }
}

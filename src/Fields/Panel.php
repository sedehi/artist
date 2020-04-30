<?php

namespace Sedehi\Artist\Fields;

class Panel
{
    protected static $title;
    protected $fields;
    protected $type = 'panel';
    protected $showOnIndex = false;
    protected $showOnDetail = false;
    protected $showOnCreate = false;
    protected $showOnUpdate = false;

    public static function make($title = null)
    {
        self::$title = $title;

        return new self;
    }

    public function fields($fields)
    {
        $this->fields = (array) $fields;

        return $this;
    }
}

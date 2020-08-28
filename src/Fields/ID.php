<?php

namespace Sedehi\Artist\Fields;

class ID extends Field
{
    public $type = 'id';

    protected $showOnIndex = true;
    protected $showOnDetail = true;
    protected $showOnCreate = false;
    protected $showOnUpdate = false;

    public function __construct()
    {
        $this->name = 'id';

        parent::__construct();
    }

    public static function make()
    {
        return new self;
    }
}

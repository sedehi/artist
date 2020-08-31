<?php

namespace Sedehi\Artist\Fields;

class Password extends Field
{
    protected $viewPath = 'artist::fields.password';
    public $type = 'password';

    protected $updateWhenEmpty = false;

    protected $showOnIndex = false;
    protected $showOnDetail = false;
    protected $showOnCreate = true;
    protected $showOnUpdate = true;

    public function __construct()
    {
        $this->name = 'password';

        parent::name($this->name);

        parent::__construct();
    }

    public static function make()
    {
        return new self;
    }
}

<?php

namespace Sedehi\Artist\Traits;

trait Visibility
{
    protected $showOnIndex = true;
    protected $showOnDetails = true;
    protected $showOnCreate = true;
    protected $showOnUpdate = true;

    public function hideOnIndex()
    {
        $this->showOnIndex = false;
    }

    public function hideOnDetails()
    {
        $this->showOnDetails = false;
    }

    public function hideOnCreate()
    {
        $this->showOnCreate = false;
    }

    public function hideOnUpdate()
    {
        $this->showOnUpdate = false;
    }
}

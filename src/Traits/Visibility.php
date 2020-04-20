<?php

namespace Sedehi\Artist\Traits;

trait Visibility
{
    protected $showOnIndex = true;
    protected $showOnDetail = true;
    protected $showOnCreate = true;
    protected $showOnUpdate = true;

    public function onlyOnIndex()
    {
        $this->showOnIndex = true;
        $this->showOnDetail = false;
        $this->showOnCreate = false;
        $this->showOnUpdate = false;

        return $this;
    }

    public function onlyOnDetail()
    {
        $this->showOnDetail = true;
        $this->showOnIndex = false;
        $this->showOnCreate = false;
        $this->showOnUpdate = false;

        return $this;
    }

    public function onlyOnForms()
    {
        $this->showOnCreate = true;
        $this->showOnUpdate = true;
        $this->showOnIndex = false;
        $this->showOnDetail = false;

        return $this;
    }

    public function exceptOnForms()
    {
        $this->showOnCreate = false;
        $this->showOnUpdate = false;
        $this->showOnIndex = true;
        $this->showOnDetail = true;

        return $this;
    }

    private function showCallback(&$property, $callback)
    {
        if (! is_callable($callback)) {
            $property = (bool) $callback;

            return $this;
        }

        $property = (bool) call_user_func($callback);

        return $this;
    }

    public function showOnIndex($callback = true)
    {
        $this->showCallback($this->showOnIndex, $callback);

        return $this;
    }

    public function showOnDetail($callback = true)
    {
        $this->showCallback($this->showOnDetail, $callback);

        return $this;
    }

    public function showOnCreate($callback = true)
    {
        $this->showCallback($this->showOnCreate, $callback);

        return $this;
    }

    public function showOnUpdate($callback = true)
    {
        $this->showCallback($this->showOnUpdate, $callback);

        return $this;
    }

    private function hideCallback(&$property, $callback)
    {
        if (! is_callable($callback)) {
            $property = ! ((bool) $callback);

            return $this;
        }

        $property = ! ((bool) call_user_func($callback));

        return $this;
    }

    public function hideOnIndex($callback = true)
    {
        $this->hideCallback($this->showOnIndex, $callback);

        return $this;
    }

    public function hideOnDetail($callback = true)
    {
        $this->hideCallback($this->showOnDetail, $callback);

        return $this;
    }

    public function hideOnCreate($callback = true)
    {
        $this->hideCallback($this->showOnCreate, $callback);

        return $this;
    }

    public function hideOnUpdate($callback = true)
    {
        $this->hideCallback($this->showOnUpdate, $callback);

        return $this;
    }
}

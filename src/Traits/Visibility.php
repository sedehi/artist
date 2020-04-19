<?php

namespace Sedehi\Artist\Traits;

trait Visibility
{
    protected $showOnIndex = true;
    protected $showOnDetails = true;
    protected $showOnCreate = true;
    protected $showOnUpdate = true;

    public function onlyOnIndex()
    {
        $this->showOnIndex = true;
        $this->showOnDetails = false;
        $this->showOnCreate = false;
        $this->showOnUpdate = false;
    }

    public function onlyOnDetail()
    {
        $this->showOnDetails = true;
        $this->showOnIndex = false;
        $this->showOnCreate = false;
        $this->showOnUpdate = false;
    }

    public function onlyOnForms()
    {
        $this->showOnCreate = true;
        $this->showOnUpdate = true;
        $this->showOnIndex = false;
        $this->showOnDetails = false;
    }

    public function exceptOnForms()
    {
        $this->showOnCreate = false;
        $this->showOnUpdate = false;
        $this->showOnIndex = true;
        $this->showOnDetails = true;
    }

    private function showCallback(&$property, $callback)
    {
        $property = $callback();

        if (! is_bool($property)) {
            throw new \Exception(get_called_class().'::'.__FUNCTION__.'()'.' Should return boolean');
        }

        return $this;
    }

    public function showOnIndex($callback)
    {
        $this->showCallback($this->showOnIndex, $callback);

        return $this;
    }

    public function showOnDetails($callback)
    {
        $this->showCallback($this->showOnDetails, $callback);

        return $this;
    }

    public function showOnCreate($callback)
    {
        $this->showCallback($this->showOnCreate, $callback);

        return $this;
    }

    public function showOnUpdate($callback)
    {
        $this->showCallback($this->showOnUpdate, $callback);

        return $this;
    }

    private function hideCallback(&$property, $callback)
    {
        $property = $callback();

        if (! is_bool($property)) {
            throw new \Exception(get_called_class().'::'.__FUNCTION__.'()'.' Should return boolean');
        }

        $property = ! $property;

        return $this;
    }

    public function hideOnIndex($callback = null)
    {
        if (is_null($callback)) {
            $this->showOnIndex = false;

            return $this;
        }

        $this->hideCallback($this->showOnIndex, $callback);

        return $this;
    }

    public function hideOnDetails($callback = null)
    {
        if (is_null($callback)) {
            $this->showOnDetails = false;

            return $this;
        }

        $this->hideCallback($this->showOnDetails, $callback);

        return $this;
    }

    public function hideOnCreate($callback = null)
    {
        if (is_null($callback)) {
            $this->showOnCreate = false;

            return $this;
        }

        $this->hideCallback($this->showOnCreate, $callback);

        return $this;
    }

    public function hideOnUpdate($callback = null)
    {
        if (is_null($callback)) {
            $this->showOnUpdate = false;

            return $this;
        }

        $this->hideCallback($this->showOnUpdate, $callback);

        return $this;
    }
}

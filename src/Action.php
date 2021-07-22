<?php

namespace Sedehi\Artist;

use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\SerializesModels;

class Action
{
    use Dispatchable ,SerializesModels;

    public $showOnIndex = true;
    public $showOnDetail = true;
    public $showOnTableRow = true;
    public $name;
    public $btnClass = 'btn btn-primary';

    public $model;
    public function __construct($model = null)
    {
        $this->model = $model;
    }

    public function view()
    {
        return null;
    }

    public function renderView()
    {
        if (! is_null($this->view())) {
            return $this->view();
        }

        return  null;
    }

    public function getShowOnIndex()
    {
        return $this->showOnIndex;
    }

    public function getShowOnDetail()
    {
        return $this->showOnDetail;
    }

    public function getShowOnTableRow()
    {
        return $this->showOnTableRow;
    }

    public function onlyOnIndex()
    {
        $this->showOnIndex = true;
        $this->showOnDetail = false;
        $this->showOnTableRow = false;

        return $this;
    }

    public function onlyOnTableRow()
    {
        $this->showOnIndex = false;
        $this->showOnDetail = false;
        $this->showOnTableRow = true;

        return $this;
    }

    public function onlyOnDetail()
    {
        $this->showOnDetail = true;
        $this->showOnIndex = false;
        $this->showOnTableRow = false;

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

    public function showOnTableRow($callback = true)
    {
        $this->showCallback($this->showOnTableRow, $callback);

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

    public function hideOnTableRow($callback = true)
    {
        $this->hideCallback($this->showOnTableRow, $callback);

        return $this;
    }
}

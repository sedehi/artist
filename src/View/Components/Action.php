<?php

namespace Sedehi\Artist\View\Components;

use Illuminate\View\Component;

class Action extends Component
{
    public $model;
    public $title;
    public $resource;
    public $action;

    /**
     * Create a new component instance.
     *
     * @return void
     */
    public function __construct($action = null, $resource = null, $model = null)
    {
        $this->model = $model;
        $this->action = $action;
        $this->resource = $resource;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render()
    {
        return view('artist::components.action');
    }
}

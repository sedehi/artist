<?php

namespace Sedehi\Artist\View\Inputs;

use Illuminate\View\Component;

class Actions extends Component
{
    public $model;
    public $resource;

    /**
     * Create a new component instance.
     *
     * @return void
     */
    public function __construct($model = null, $resource = null)
    {
        $this->model = $model;
        $this->resource = $resource;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render()
    {
        return view('artist::components.actions');
    }
}

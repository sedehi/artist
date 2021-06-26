<?php

namespace Sedehi\Artist\View\Components\Inputs;

use Illuminate\View\Component;

class Checkbox extends Component
{
    public $grid = 'col-md-6';
    public $model;
    public $title;
    public $class;
    public $checked = false;
    public $value = 'on';

    /**
     * Create a new component instance.
     *
     * @return void
     */
    public function __construct($model = null)
    {
        $this->model = $model;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render()
    {
        return view('artist::components.inputs.checkbox');
    }
}

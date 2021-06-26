<?php

namespace Sedehi\Artist\View\Components\Inputs;

use Illuminate\View\Component;

class Radio extends Component
{
    public $grid = 'col-md-6';
    public $model;
    public $options;
    public $title;
    public $class;
    public $value;

    /**
     * Create a new component instance.
     *
     * @return void
     */
    public function __construct($options, $model = null)
    {
        $this->options = $options;
        $this->model = $model;
    }

    /**
     * Get the view / contents that represent the component.
     *
     * @return \Illuminate\Contracts\View\View|\Closure|string
     */
    public function render()
    {
        return view('artist::components.inputs.radio');
    }
}
